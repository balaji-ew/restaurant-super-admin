'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

/**
 * The footer control on every list.
 *
 * Page numbers are windowed rather than printed in full — twenty branches is
 * two pages, but a year of orders is hundreds, and a row of hundreds of
 * circles is not navigation.
 */
export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  className,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  className?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const pages = windowedPages(page, pageCount);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 text-sm text-ink-muted">
        <span>Show</span>
        <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
          <SelectTrigger aria-label="Rows per page" className="h-9 w-[74px] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-2">
        <PageButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          ariaLabel="Previous page"
        >
          <ChevronLeft className="size-4" />
        </PageButton>

        {pages.map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-ink-subtle" aria-hidden>
              …
            </span>
          ) : (
            <PageButton
              key={entry}
              onClick={() => onPageChange(entry)}
              active={entry === page}
              ariaLabel={`Page ${entry}`}
              ariaCurrent={entry === page}
            >
              {entry}
            </PageButton>
          ),
        )}

        <PageButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          ariaLabel="Next page"
        >
          <ChevronRight className="size-4" />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
  ariaLabel,
  ariaCurrent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  ariaCurrent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent ? 'page' : undefined}
      className={cn(
        'grid size-9 cursor-pointer place-items-center rounded-full border text-sm font-medium transition-colors',
        active
          ? 'border-plum-900 bg-plum-900 text-white'
          : 'border-input bg-background text-ink hover:bg-plum-tint',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-background',
      )}
    >
      {children}
    </button>
  );
}

/**
 * At most seven slots: first, last, the current page and its neighbours, with
 * an ellipsis standing in for whatever is skipped.
 */
function windowedPages(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const candidates = [1, pageCount, page, page - 1, page + 1];
  const sorted = candidates
    .filter((p, index) => p >= 1 && p <= pageCount && candidates.indexOf(p) === index)
    .sort((a, b) => a - b);

  const result: (number | 'gap')[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - (sorted[index - 1] as number) > 1) result.push('gap');
    result.push(value);
  });
  return result;
}

/** Slice a list for the current page. Kept beside the control that drives it. */
export function paginate<T>(rows: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return rows.slice(start, start + perPage);
}
