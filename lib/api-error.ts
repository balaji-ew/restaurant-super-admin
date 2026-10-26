/**
 * Every backend response uses the same envelope:
 *
 *   { "success": true,  "data": {...}, "meta": {...} }
 *   { "success": false, "error": { "code", "message", "field?", "fields?", "requestId?" } }
 *
 * So the human-readable text lives at `error.message` — NOT at the top level.
 * Everything here exists so callers never have to reach into that shape by hand.
 */

/** One field-level validation failure (`apperr.FieldError`). */
export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

/** The error half of the envelope (`httpx.ErrorBody`). */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  field?: string;
  fields?: ApiFieldError[];
  /**
   * Data the client needs to act on the error rather than merely show it —
   * the 3-D Secure client secret, for instance, without which the customer
   * cannot finish paying.
   */
  meta?: Record<string, unknown>;
  requestId?: string;
}

/** The full envelope (`httpx.Envelope`). */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  meta?: unknown;
  error?: ApiErrorBody;
}

/**
 * A rejected request. `message` is safe to show to a user; `code` is what
 * callers should branch on, since the backend may reword `message`.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly field?: string;
  readonly fields: ApiFieldError[];
  /** Structured recovery data — see `ApiErrorBody.meta`. */
  readonly meta: Record<string, unknown>;
  readonly requestId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      field?: string;
      fields?: ApiFieldError[];
      meta?: Record<string, unknown>;
      requestId?: string;
    } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.status = options.status;
    this.field = options.field;
    this.fields = options.fields ?? [];
    this.meta = options.meta ?? {};
    this.requestId = options.requestId;
  }
}

/**
 * Copy for the cases where the backend cannot say anything useful — either it
 * sent an error code with no message, or the response never made it far enough
 * to carry an envelope at all (proxy HTML, gateway timeout, offline).
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  VALIDATION_FAILED: 'Please check the details you entered and try again.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  PERMISSION_DENIED: "You don't have permission to do that.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  CONFLICT: 'That change conflicts with something that already exists.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again.',
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  ACCOUNT_INACTIVE: 'This account is no longer active.',
  EMAIL_IN_USE: 'An account with this email already exists.',
  OTP_INVALID: 'That code is not correct.',
  OTP_EXPIRED: 'That code has expired. Please request a new one.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  TOKEN_INVALID: 'Your session is no longer valid. Please sign in again.',
  NETWORK_ERROR: "We couldn't reach the server. Please check your connection.",
};

const MESSAGE_BY_STATUS: Record<number, string> = {
  400: MESSAGE_BY_CODE.VALIDATION_FAILED,
  401: MESSAGE_BY_CODE.UNAUTHENTICATED,
  403: MESSAGE_BY_CODE.PERMISSION_DENIED,
  404: MESSAGE_BY_CODE.NOT_FOUND,
  409: MESSAGE_BY_CODE.CONFLICT,
  422: 'That request could not be completed.',
  429: MESSAGE_BY_CODE.RATE_LIMITED,
  500: MESSAGE_BY_CODE.INTERNAL_ERROR,
  502: MESSAGE_BY_CODE.INTERNAL_ERROR,
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The request timed out. Please try again.',
};

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/** Pulls `error` out of a response body, tolerating non-envelope payloads. */
function readErrorBody(payload: unknown): ApiErrorBody | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const error = (payload as ApiEnvelope).error;
  if (!error || typeof error !== 'object') return undefined;
  return error;
}

/**
 * Turns any failed response body into an `ApiError` with a message worth
 * showing. Preference order: the backend's own message, then copy keyed on the
 * error code, then copy keyed on the HTTP status, then a generic fallback.
 */
export function parseApiError(payload: unknown, status?: number): ApiError {
  const body = readErrorBody(payload);
  const code = body?.code;

  const message =
    body?.message?.trim() ||
    body?.fields?.[0]?.message?.trim() ||
    (code ? MESSAGE_BY_CODE[code] : undefined) ||
    (status ? MESSAGE_BY_STATUS[status] : undefined) ||
    GENERIC_MESSAGE;

  return new ApiError(message, {
    code,
    status,
    field: body?.field ?? body?.fields?.[0]?.field,
    fields: body?.fields,
    meta: body?.meta,
    requestId: body?.requestId,
  });
}

/** The request never produced a response — DNS failure, CORS, offline, abort. */
export function networkError(): ApiError {
  return new ApiError(MESSAGE_BY_CODE.NETWORK_ERROR, { code: 'NETWORK_ERROR' });
}
