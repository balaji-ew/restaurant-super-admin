/**
 * Presentation helpers.
 *
 * Money arrives from the server as integer cents (core invariant 4). Every
 * screen that shows a price goes through here, so there is exactly one place
 * the cents-to-dollars division happens and no component is tempted to do it
 * inline and get it subtly wrong.
 */
import type { Money } from './types';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `$110.00`. Pass `compact` for `$110` when the cents are always zero. */
export function formatMoney(cents: Money, compact = false): string {
  const dollars = cents / 100;
  return compact && Number.isInteger(dollars) ? usdWhole.format(dollars) : usd.format(dollars);
}

/** The bare number, for inputs that render their own `$` addon. */
export function centsToInput(cents: Money | null | undefined): string {
  if (cents === null || cents === undefined) return '';
  return (cents / 100).toFixed(2).replace(/\.00$/, '');
}

/**
 * Keeps a price field to something that can be a price.
 *
 * `inputMode="decimal"` only asks the phone for a numeric keypad — it is a
 * hint, not a rule, and on a desktop it does nothing at all. So the price
 * fields happily accepted letters, and the value was silently parsed to 0
 * on save: a product typed as "abc" saved at zero rather than complaining.
 *
 * Filtering on the way in rather than validating on the way out means the
 * wrong character never appears, which is easier to understand than a
 * message explaining why it was removed.
 *
 * Digits and at most one decimal point, at most two places after it. An
 * empty string stays empty — the field has to be clearable.
 */
export function toMoneyInput(raw: string): string {
  const cleaned = String(raw ?? '').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  // Everything after the first point is one fraction, so '1.2.3' becomes
  // '1.23' rather than being rejected outright.
  return `${whole}.${rest.join('').slice(0, 2)}`;
}

export function inputToCents(value: string): Money {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const numberFmt = new Intl.NumberFormat('en-US');

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

/** `+12.4%` / `-3.0%` — the sign is the point, so it is always shown. */
export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * `26 Aug 2026` — the format used across the approved screens.
 *
 * `timeZone` is deliberately a parameter rather than a default: anything shown
 * against a branch renders in that branch's zone, not the viewer's (NFR-10).
 */
export function formatDate(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone,
  }).format(d);
}

export function formatDateRange(from: string | null, to: string | null): string {
  if (!from && !to) return 'No date limit';
  return `${formatDate(from)} - ${formatDate(to)}`;
}

export function formatTime(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(d);
}

export function formatDateTime(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return '—';
  return `${formatDate(iso, timeZone)}, ${formatTime(iso, timeZone)}`;
}

/** `<input type="date">` wants `YYYY-MM-DD`, not an ISO instant. */
export function toDateInput(value: string | null | undefined): string {
  return value?.slice(0, 10) ?? '';
}

/**
 * An instant, as a `datetime-local` input wants it.
 *
 * Local rather than UTC, because the person setting it means nine o'clock
 * where the shop is. Sliced to minutes — seconds on a scheduling field are
 * noise nobody is setting deliberately.
 */
export function toDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function fromDateTimeInput(value: string): string | null {
  if (!value) return null;

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * A date input's value, ready to send.
 *
 * Sent as the plain YYYY-MM-DD the input already holds, rather than pushed
 * through Date.toISOString() first. These are calendar dates — an on-sale
 * window, a coupon's run — not instants, and turning them into timestamps
 * invited a timezone to move them a day either side of midnight.
 *
 * It also broke scheduling outright: the API read YYYY-MM-DD and silently
 * discarded anything else, so a window set here was accepted and never
 * stored. The API takes both shapes now; this sends the honest one.
 */
export function fromDateInput(value: string): string | null {
  return value || null;
}

/** Turns `in_production` into `In Production` for any enum we show verbatim. */
export function titleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return person?.firstName ? `${person.firstName} ${person.lastName}`.trim() : '-';
}
