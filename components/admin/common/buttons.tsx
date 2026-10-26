'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The console's buttons.
 *
 * The vendored kit's Button is a large variant matrix aimed at a different
 * design; the approved screens use exactly four shapes — a plum pill, a
 * bordered white pill, a red pill and a lilac chip — all at one height. Naming
 * those four directly is less code than configuring the kit into them, and it
 * makes a wrong-looking button a compile error rather than a visual review
 * finding.
 */

type Tone = 'primary' | 'outline' | 'destructive' | 'soft';

const TONE_CLASS: Record<Tone, string> = {
  primary: 'bg-plum-900 text-white hover:bg-plum-800',
  outline: 'border border-input bg-background text-ink hover:bg-plum-tint',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  soft: 'bg-plum-tint text-plum-900 hover:bg-plum-tint-strong',
};

const SIZE_CLASS = {
  md: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-[13px]',
} as const;

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: keyof typeof SIZE_CLASS;
  icon?: ReactNode;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { tone = 'primary', size = 'md', icon, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
});

/** The same shapes, as a link. Navigation should be a link, not a click handler. */
export function ActionLink({
  href,
  tone = 'primary',
  size = 'md',
  icon,
  className,
  children,
  download,
}: {
  href: string;
  tone?: Tone;
  size?: keyof typeof SIZE_CLASS;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  /** Saves the target instead of navigating to it — for files served from /public. */
  download?: boolean;
}) {
  return (
    <Link
      href={href}
      download={download}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors',
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
