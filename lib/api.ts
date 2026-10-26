import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/api.config';
import { getAccessToken } from '@/config/general.config';
import { networkError, parseApiError } from '@/lib/api-error';

/**
 * The console's HTTP client.
 *
 * `baseURL` already carries the `/v1` prefix, so callers pass bare resource
 * paths — `/admin/products`, not `/v1/admin/products`. Same arrangement as the
 * storefront app so a developer moving between the two does not have to
 * remember which one includes the version.
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer automatically. Every `/admin/*` route needs it and no
// caller should be able to forget it.
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Normalise failures into an ApiError carrying the backend's `error.message`
// plus its `code`, so callers can show readable copy and branch on the code
// rather than string-matching a message the server may reword.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(networkError());
    }
    return Promise.reject(parseApiError(error.response.data, error.response.status));
  },
);

/**
 * Unwraps the backend envelope.
 *
 * Every successful response is `{ success, data, meta }`; callers want `data`
 * and should not each reach through the wrapper to get it.
 */
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await axiosInstance.get(path, { params });
  return data?.data as T;
}

/**
 * Like apiGet, but keeps the envelope's `meta`.
 *
 * Server-paged lists need it: `data` is one page and `meta.total` is how many
 * rows match the filters, and a pager given only the page length would show a
 * single page however many there really are.
 */
export async function apiGetWithMeta<T, M = Record<string, number>>(
  path: string,
  params?: Record<string, unknown>,
): Promise<{ data: T; meta: M; stats: any }> {
  const { data } = await axiosInstance.get(path, { params });
  return { data: data?.data as T, stats: data.stats as T, meta: (data?.meta ?? {}) as M };
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axiosInstance.post(path, body);
  return data?.data as T;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axiosInstance.patch(path, body);
  return data?.data as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await axiosInstance.put(path, body);
  return data?.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await axiosInstance.delete(path);
  return data?.data as T;
}
