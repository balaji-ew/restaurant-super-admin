/**
 * Single source of truth for the backend base URL.
 *
 * `NEXT_PUBLIC_API_BASE_URL` holds the API *origin* only (no version segment,
 * no trailing slash) — e.g. `http://localhost:8080`. The `/v1` prefix comes
 * from the backend's OpenAPI `basePath` and is appended here so that no caller
 * can forget it or spell it differently. Same contract as the storefront app,
 * deliberately: the two front-ends talk to one server and a drift between how
 * they build URLs is a class of bug nobody should have to debug twice.
 */
const API_VERSION = 'v1';

const rawOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

if (!rawOrigin) {
  // Surfaces the misconfiguration at boot instead of as a stream of requests
  // to `/v1/staff/auth/login` against the Next.js origin itself.
  console.warn(
    '[api] NEXT_PUBLIC_API_BASE_URL is not set — API requests will resolve against the app origin.',
  );
}

/** API origin without the version segment, e.g. `http://localhost:8080`. */
export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');

/** Versioned base every request is built on, e.g. `http://localhost:8080/v1`. */
export const API_BASE_URL = `${API_ORIGIN}/${API_VERSION}`;

/**
 * Staff auth endpoints.
 *
 * The backend keeps customer and staff in separate realms. This console is
 * staff-only, so it uses `/staff/auth/*` throughout — a customer token will
 * not open any `/admin/*` route, and RBAC-11 says it never should.
 */
export const STAFF_AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/staff/auth/login`,
  refresh: `${API_BASE_URL}/staff/auth/refresh`,
  logout: `${API_BASE_URL}/staff/auth/logout`,
} as const;
