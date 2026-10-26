'use client';

/**
 * The console's data layer and state management.
 *
 * Screens read through `useCollection` and `useRecord`, and write through
 * `mutate`. Reads utilize TanStack React Query for caching, background
 * revalidation, and sharing state across components. Writes invalidate what
 * they touched, keeping UI state synchronized.
 */
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';
import type { ID } from './types';

export interface BaseRecord {
  id: ID;
  [key: string]: unknown;
}

export interface Collections {
  // Modules define collections here, e.g.:
  // items: BaseRecord[];
  [key: string]: unknown[];
}

const EMPTY: Record<string, unknown[]> = {};

const fetchers: Record<string, () => Promise<unknown[]>> = {};

/**
 * Fetch a collection into the query cache if it is not already there.
 */
export async function ensure<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = queryClient.getQueryData<T>([key]);
  if (cached) return cached;
  const data = await loader();
  queryClient.setQueryData([key], data);
  return data;
}

/**
 * Read a collection from the cache or server.
 */
export function useCollection<T = unknown>(key: string): T[] {
  const { data } = useQuery({
    queryKey: [key],
    queryFn: fetchers[key] ?? (() => Promise.resolve([])),
    enabled: Boolean(fetchers[key]),
  });
  return (data ?? EMPTY[key] ?? []) as T[];
}

/**
 * Check whether a collection's read is still in flight.
 */
export function useCollectionLoading(key: string): boolean {
  const { isLoading, isFetching, isError } = useQuery({
    queryKey: [key],
    queryFn: fetchers[key] ?? (() => Promise.resolve([])),
    enabled: Boolean(fetchers[key]),
  });
  return (isLoading || isFetching) && !isError;
}

/**
 * Read one record by ID from a cached collection.
 */
export function useRecord<T extends { id: ID }>(
  key: string,
  id: ID | undefined,
): { record: T | undefined; isLoading: boolean } {
  const rows = useCollection<T>(key);
  const collectionLoading = useCollectionLoading(key);

  if (!id) return { record: undefined, isLoading: false };

  const found = rows.find((r) => r.id === id);
  return { record: found, isLoading: collectionLoading && !found };
}

/**
 * Generates a client-side temporary ID for new records before persistence.
 */
export function newId(prefix = 'rec'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Invalidate cached collections and trigger re-read from the server.
 */
export function refresh(...keys: string[]) {
  keys.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
}

/**
 * Shared mutations registry. Module-specific writes are added here.
 */
export const mutate = {
  // Add domain mutations here as new business modules are created.
};
