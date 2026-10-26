import 'next-auth';
import 'next-auth/jwt';

/**
 * The shape of a staff session.
 *
 * Kept close to what the backend actually returns from
 * `POST /v1/staff/auth/login`: a token pair plus the staff record and its role
 * assignments. `role` on the session user is a formatted label for the header
 * and nothing more — authorisation is re-resolved server-side on every
 * mutation (RBAC-08), so nothing here is ever trusted as a permission.
 */

export interface StaffRoleAssignment {
  role: string;
  scopeType: 'brand' | 'branch' | 'central_kitchen';
  branchId?: string | null;
}

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    accessToken: string;
    refreshToken: string;
    roles: StaffRoleAssignment[];
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      /** Display label, e.g. `Branch Manager`. Presentation only. */
      role?: string;
      /**
       * The raw assignments, for deciding what to show and which ids to scope
       * reads by. Never a grant: the server re-resolves authorisation on every
       * request, so this only ever removes things from the screen.
       */
      roles?: StaffRoleAssignment[];
    };
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    /** Epoch milliseconds at which `accessToken` stops being accepted. */
    accessTokenExpires?: number;
    error?: 'RefreshAccessTokenError';
    staff?: {
      id: string;
      name: string;
      email: string;
      roles: StaffRoleAssignment[];
    };
  }
}
