import { getSession } from 'next-auth/react';

/**
 * The bearer token for outbound API calls.
 *
 * Read from the session rather than from storage so there is one copy of it,
 * held in the NextAuth JWT, and refreshed centrally — a caller never has to
 * know whether the token it is about to use is still valid.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken ?? null;
}

export const ONE_DAY = 24 * 60 * 60 * 1000;
