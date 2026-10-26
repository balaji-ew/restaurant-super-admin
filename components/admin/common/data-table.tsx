'use client';

import { type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Tailwind width/alignment classes applied to both the header and the cells. */
  className?: string;
  cell: (row: T) => ReactNode;
}

/**
 * The list table used across the console.
 *
 * A hand-rolled table rather than the vendored data-grid: the approved screens
 * want a tinted header band, generous row height and a trailing action menu,
 * and expressing that through the grid's config surface is more code than the
 * markup it produces. Sorting and filtering happen in the page, which is where
 * the domain rules that decide them live.
 *
 * The wrapper scrolls horizontally on its own so a wide table never makes the
 * whole page scroll sideways.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-input px-6 py-16 text-center">
        <p className="text-sm text-ink-muted">{empty ?? 'Nothing to show yet.'}</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="bg-table-head">
            {columns.map((column, index) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-5 py-3.5 text-[13px] font-medium text-ink-muted',
                  index === 0 && 'rounded-s-lg',
                  index === columns.length - 1 && 'rounded-e-lg',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border last:border-0',
                onRowClick && 'cursor-pointer transition-colors hover:bg-plum-tint/40',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('px-5 py-4 align-middle text-sm text-ink', column.className)}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The trailing "…" menu.
 *
 * Stops propagation so opening the menu on a clickable row does not also
 * navigate to the row's detail page — the single most annoying bug this
 * pattern produces.
 */
export function RowActions({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Row actions"
          onClick={(event) => event.stopPropagation()}
          className="grid size-8 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:bg-plum-tint hover:text-plum-900"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The small square image slot on catalogue rows. */
export function RowThumb({ src, alt }: { src?: string; alt: string }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
      {src ? (
        /*
         * A plain <img>, not next/image. Product imagery is operator-uploaded
         * and served from whichever origin the media store lives on, which the
         * image optimiser is not configured to allow — it would refuse the host
         * and render a broken box on every row.
         */
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <ImagePlaceholder />
      )}
    </span>
  );
}

function ImagePlaceholder() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-ink-subtle" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
      <path
        d="m4 17 4.5-4.5L12 16l3-3 5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
