'use client';

import { cn } from '@/lib/utils';

/**
 * The on/off control in catalogue tables.
 *
 * Colour alone is never the signal — the word sits beside the track, which is
 * both a WCAG 1.4.1 requirement (SF-37/NFR-09) and the difference between a
 * manager glancing at a list and a manager squinting at it.
 */
export function StatusToggle({
  checked,
  onChange,
  onLabel = 'On',
  offLabel = 'Off',
  ariaLabel,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onChange(!checked);
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          checked ? 'bg-emerald-500' : 'bg-red-500',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span
          className={cn(
            'absolute size-[18px] rounded-full bg-white transition-transform',
            checked ? 'translate-x-[23px]' : 'translate-x-1',
          )}
        />
      </button>
      <span className="text-sm text-ink">{checked ? onLabel : offLabel}</span>
    </span>
  );
}

/**
 * The plum pill used for the standalone toggles inside forms — "Active Dates",
 * "Visibility & scheduling", "Require a selection".
 *
 * Distinct from `StatusToggle` on purpose: those answer "is this record live",
 * these answer "does this section apply", and giving them the same red/green
 * treatment would imply an availability meaning they do not carry.
 */
export function SectionToggle({
  checked,
  onChange,
  ariaLabel,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-plum-900' : 'bg-zinc-200',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn(
          'absolute size-[22px] rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[27px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

type Tone = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'brand';

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  info: 'bg-sky-50 text-sky-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-zinc-100 text-zinc-600',
  brand: 'bg-plum-tint text-plum-800',
};

/** A status pill with a leading dot, as drawn on the coupon cards. */
export function StatusPill({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
