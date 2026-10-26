'use client';

/**
 * Who is signed in, and what they may see.
 *
 * One place the whole console asks, so no screen has to reach into the session
 * and interpret role assignments for itself. Everything it answers is
 * presentation: the server re-resolves authorisation on every request, and a
 * control hidden here is still refused there if someone finds it another way.
 *
 * What it buys is a console that does not offer what it cannot deliver — and
 * one that stops making calls it knows will be refused. A branch manager used
 * to land on the dashboard, fire three network-wide reporting requests, and
 * collect three 403s before the page rendered.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { NO_VIEWER, viewerFrom, type RoleAssignment, type Viewer } from '@/lib/admin/permissions';

const ViewerContext = createContext<Viewer>(NO_VIEWER);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const viewer = useMemo(() => {
    // Nothing is granted until the session is actually loaded. Showing a
    // control and taking it away a moment later reads as a glitch; showing it
    // a beat late does not.
    if (status !== 'authenticated') return NO_VIEWER;
    return viewerFrom((session?.user?.roles ?? []) as RoleAssignment[], true);
  }, [session, status]);

  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

/** The signed-in user's permissions and scope. */
export function useViewer(): Viewer {
  return useContext(ViewerContext);
}
