'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The white card every screen sits inside.
 *
 * `min-h-full` rather than a fixed height so a short list still fills the
 * viewport — a table of three rows floating in a card two hundred pixels tall
 * reads as an error state rather than as a small catalogue.
 */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-full flex-col gap-6 rounded-2xl border border-border bg-background p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The same card with no padding, for create and edit screens where the header
 * bar runs edge to edge with a rule under it.
 */
export function FormShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-full flex-col rounded-2xl border border-border bg-background',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * The body of a create/edit screen: a wide main column with a narrower rail
 * for the things that describe the record rather than define it — status,
 * imagery, scheduling.
 */
export function FormBody({
  children,
  aside,
  asideExtra,
  className,
}: {
  children: ReactNode;
  aside?: ReactNode;
  /** Further cards stacked under `aside` in the same rail. */
  asideExtra?: ReactNode;
  className?: string;
}) {
  if (!aside) {
    return <div className={cn('flex flex-col gap-5 p-6', className)}>{children}</div>;
  }

  return (
    <div className={cn('grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]', className)}>
      <div className="flex flex-col gap-5">{children}</div>
      <div className="flex flex-col gap-5">
        {aside}
        {asideExtra}
      </div>
    </div>
  );
}

/** Pushes the list's pagination to the bottom of the card on short pages. */
export function ListBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex-1', className)}>{children}</div>;
}
