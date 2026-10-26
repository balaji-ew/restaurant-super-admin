'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The title block every list screen opens with.
 *
 * Title on the left with its trail beneath, actions on the right. The last
 * crumb is the current page and carries the accent colour — it is a label, not
 * a link, so it is rendered as text rather than an `<a>` that goes nowhere.
 */
export function PageHeader({
  title,
  crumbs = [],
  actions,
  className,
}: {
  title: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-[22px] font-semibold leading-tight text-ink">{title}</h1>
        {crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mt-1.5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 ? <ChevronRight className="size-3.5 text-ink-subtle" /> : null}
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="text-ink-muted hover:text-plum-900">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-violet-accent' : 'text-ink-muted'}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

/**
 * The title block for a create or edit screen: a back control, the title, and
 * the save/cancel pair pinned to the right.
 *
 * `onBack` defaults to browser history rather than a fixed route so the arrow
 * returns you where you actually came from — the list, or the detail page that
 * linked here.
 */
export function FormHeader({
  title,
  onBack,
  actions,
  className,
}: {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack ?? (() => router.back())}
          aria-label="Go back"
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-input bg-background text-ink transition-colors hover:bg-plum-tint"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-[22px] font-semibold leading-tight text-ink">{title}</h1>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
