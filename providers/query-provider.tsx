'use client';

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

/**
 * One client, created at module scope rather than in state.
 *
 * The data layer (`lib/admin/store.ts`) writes through plain functions called
 * from event handlers, not hooks, so it needs to reach the client to
 * invalidate after a mutation. A module-level instance is the only way to
 * offer that without threading a hook through every call site.
 *
 * Safe here because this console is client-rendered behind a session guard:
 * there is one browser, one user, and no server-side request to leak a cache
 * across. A server-rendered app with per-request data would need the
 * useState form instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Admin data is operational, not static — but refetching on every
      // window focus makes a demo or a review flicker for no benefit.
      refetchOnWindowFocus: false,
      staleTime: 15_000,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const message = error.message;
      if (!message) return;
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive" close={false}>
            <AlertIcon>
              <AlertCircle className="h-4 w-4" />
            </AlertIcon>
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
    },
  }),
});

const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export { QueryProvider };
