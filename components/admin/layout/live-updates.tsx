'use client';

import { useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/config/api.config';
import { queryClient } from '@/providers/query-provider';

/**
 * Live updates for the console using Server-Sent Events (SSE).
 *
 * Listens on the API's event stream (GET /v1/admin/events) and refreshes
 * cached queries affected by received events. Events notify what changed,
 * and the query cache triggers seamless background re-fetching.
 *
 * Since EventSource does not send an Authorization header natively, the access
 * token is passed in the query string. When the session token refreshes via
 * NextAuth, the stream reconnects automatically with the fresh token.
 */

/**
 * Map of event types to query keys that become stale when the event is received.
 * Add new event mappings as new business modules are introduced.
 */
export const EVENT_INVALIDATIONS: Record<string, string[][]> = {
  // Example: 'data.changed': [['items']],
};

const RETRY_MS = 5_000;

export function LiveUpdates() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!accessToken || !API_BASE_URL) return;

    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const pending = new Map<string, string[]>();
    let flush: ReturnType<typeof setTimeout> | undefined;

    const schedule = (keys: string[][]) => {
      for (const key of keys) pending.set(JSON.stringify(key), key);
      clearTimeout(flush);
      flush = setTimeout(() => {
        pending.forEach((key) => void queryClient.invalidateQueries({ queryKey: key }));
        pending.clear();
      }, 300);
    };

    const open = (token: string) => {
      if (stopped) return;
      source = new EventSource(
        `${API_BASE_URL}/admin/events?accessToken=${encodeURIComponent(token)}`,
      );

      for (const [type, keys] of Object.entries(EVENT_INVALIDATIONS)) {
        source.addEventListener(type, () => schedule(keys));
      }

      source.onerror = () => {
        if (!source || source.readyState !== EventSource.CLOSED) return;
        source.close();
        // Token might have expired. Request fresh token from NextAuth session and reconnect.
        retry = setTimeout(async () => {
          const fresh = (await getSession())?.accessToken;
          if (fresh && fresh !== token) return;
          if (fresh) open(fresh);
        }, RETRY_MS);
      };
    };

    open(accessToken);

    return () => {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(flush);
      source?.close();
    };
  }, [accessToken]);

  return null;
}
