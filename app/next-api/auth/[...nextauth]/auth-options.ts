import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { STAFF_AUTH_ENDPOINTS } from '@/config/api.config';

/**
 * Staff sessions.
 *
 * The console holds the backend's access and refresh tokens inside the
 * NextAuth JWT rather than in browser storage, so nothing long-lived is
 * readable by script on the page. Every outbound request picks the access
 * token up from the session (`lib/api.ts`).
 *
 * The staff realm is separate from the customer one by design — this file only
 * ever talks to `/v1/staff/auth/*`. A customer token would be rejected by
 * every `/admin/*` route anyway (RBAC-11), and mixing the two here is how that
 * separation quietly stops being true.
 */

/** Access tokens are short; this is how long we assume one stays good. */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/** Re-mint a minute early so a request never races the expiry it just passed. */
const REFRESH_SKEW_MS = 60 * 1000;

const REFRESH_REUSE_WINDOW_MS = 30 * 1000;

interface StaffRoleAssignment {
  role: string;
  scopeType: 'brand' | 'branch' | 'central_kitchen';
  branchId?: string | null;
}

interface SessionToken {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: 'RefreshAccessTokenError';
  staff?: {
    id: string;
    name: string;
    email: string;
    roles: StaffRoleAssignment[];
  };
}

// Kept on globalThis so every route bundle in the process shares it.
const globalForAuth = globalThis as typeof globalThis & {
  __staffRefreshCache?: Map<
    string,
    { promise: Promise<SessionToken>; at: number; pending: boolean }
  >;
};
const refreshCache: Map<string, { promise: Promise<SessionToken>; at: number; pending: boolean }> =
  (globalForAuth.__staffRefreshCache ??= new Map());

function getAuthPayload<T extends Record<string, any>>(
  payload: T | null | undefined,
): {
  accessToken?: string;
  refreshToken?: string;
  staff?: Record<string, any>;
} {
  const responseData = payload?.data ?? payload ?? {};

  return {
    accessToken: responseData?.accessToken ?? undefined,
    refreshToken: responseData?.refreshToken ?? undefined,
    staff: responseData?.staff ?? {},
  };
}

async function requestRefresh(token: SessionToken): Promise<SessionToken> {
  try {
    // console.log('[auth] refreshing staff token', new Date().toISOString());

    const response = await fetch(STAFF_AUTH_ENDPOINTS.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ...(token.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    // console.log('[auth] refresh response status', response.status);

    // Server trouble is not proof the session is dead — keep it and retry on
    // the next session check.
    if (response.status === 408 || response.status === 429 || response.status >= 500) {
      return token;
    }

    const payload = await response.json().catch(() => null);
    const authPayload = getAuthPayload(payload);

    // The backend actually rejected the refresh token.
    if (!response.ok || !authPayload.accessToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    return {
      ...token,
      accessToken: authPayload.accessToken,
      // The server may rotate the refresh token; if it does not, keep the one
      // we have rather than writing `undefined` over a token that still works.
      refreshToken: authPayload.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
      error: undefined,
    };
  } catch {
    // Network failure: same reasoning as 5xx, do not sign the user out.
    // console.log('[auth] refresh network error');
    return token;
  }
}

async function refreshAccessToken(token: SessionToken): Promise<SessionToken> {
  // Signalled rather than thrown: the protected layout watches for this and
  // signs the user out, which is a far clearer outcome than every subsequent
  // request failing with a 401 and no explanation.
  if (!token.refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  const now = Date.now();
  refreshCache.forEach((entry, key) => {
    if (!entry.pending && now - entry.at >= REFRESH_REUSE_WINDOW_MS) {
      refreshCache.delete(key);
    }
  });

  const key = token.refreshToken;
  const cached = refreshCache.get(key);
  if (cached) return cached.promise;

  const promise = requestRefresh(token);
  const entry = { promise, at: now, pending: true };
  refreshCache.set(key, entry);

  promise.then((result) => {
    if (refreshCache.get(key) !== entry) return;

    entry.pending = false;
    entry.at = Date.now();

    // Transient failures leave the token unchanged and can retry immediately.
    if (result.accessToken === token.accessToken && !result.error) {
      refreshCache.delete(key);
    }
  });

  return promise;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Staff credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const response = await fetch(STAFF_AUTH_ENDPOINTS.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });

        const payload = await response.json().catch(() => null);
        const authPayload = getAuthPayload(payload);

        if (!response.ok || !authPayload.accessToken) {
          // A specific reason here would be echoed back to an unauthenticated
          // caller and would say whether the address exists. It must not.

          throw new Error(
            payload?.error?.message ??
              payload?.message ??
              (response?.statusText || 'Invalid credentials'),
          );
        }

        const staff = authPayload.staff ?? {};
        return {
          id: staff.id ?? credentials.email,
          name: staff.name ?? credentials.email,
          email: staff.email ?? credentials.email,
          accessToken: authPayload.accessToken,
          refreshToken: authPayload.refreshToken ?? '',
          roles: staff.roles ?? [],
        } as never;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const typed = token as SessionToken & typeof token;

      if (user) {
        const authed = user as unknown as {
          id: string;
          name: string;
          email: string;
          accessToken: string;
          refreshToken: string;
          roles: StaffRoleAssignment[];
        };
        typed.accessToken = authed.accessToken;
        typed.refreshToken = authed.refreshToken;
        typed.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
        typed.staff = {
          id: authed.id,
          name: authed.name,
          email: authed.email,
          roles: authed.roles ?? [],
        };
        return typed;
      }

      // Explicit client-side update — e.g. after saving the profile form,
      // `updateSession({ name, email })` lands here as `session`. Merge it
      // into `typed.staff` (not `typed` itself, and not `token.user`, since
      // this token keeps the user under `staff`) so the header reflects the
      // change immediately without a full re-login.
      if (trigger === 'update' && session) {
        typed.staff = {
          ...typed.staff,
          ...session,
        };
        return typed;
      }

      if (typed.error === 'RefreshAccessTokenError') {
        return typed;
      }

      if (typed.accessTokenExpires && Date.now() < typed.accessTokenExpires - REFRESH_SKEW_MS) {
        return typed;
      }

      return (await refreshAccessToken(typed)) as typeof token;
    },

    async session({ session, token }) {
      const typed = token as SessionToken;
      const target = session as typeof session & {
        accessToken?: string;
        error?: string;
      };

      target.accessToken = typed.accessToken;
      target.error = typed.error;
      target.user = {
        ...session.user,
        id: typed.staff?.id,
        name: typed.staff?.name,
        email: typed.staff?.email,
        // The primary assignment is what the header shows. Multi-branch staff
        // (RBAC-02) hold several; permissions still resolve per branch on the
        // server, and this is presentation only.
        role: formatRole(typed.staff?.roles?.[0]?.role),
        // The assignments themselves, so the console can hide what this person
        // cannot use and scope its reads to the ids they are allowed to ask
        // about. Still presentation only — the server re-checks everything.
        roles: typed.staff?.roles ?? [],
      } as typeof session.user;

      return target;
    },
  },

  pages: {
    signIn: '/signin',
  },
};

/** `branch_manager` reads as `Branch Manager` in the header. */
function formatRole(role?: string): string | undefined {
  if (!role) return undefined;
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default authOptions;