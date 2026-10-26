'use client';

import { type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** The search + filters row that sits between the title and the table. */
export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      {children}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative w-full sm:w-[248px]', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-input bg-background ps-10 pe-4 text-sm text-ink outline-none placeholder:text-ink-subtle focus-visible:border-plum-700"
      />
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * A filter pill.
 *
 * The lilac ground is not decoration — it is how the approved screens separate
 * "narrow what you are looking at" from the plain white search field, which is
 * the one control that does not change the set of records on screen.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  icon,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-11 w-full gap-2 rounded-xl border-transparent bg-plum-tint px-4 text-sm font-medium text-ink data-[placeholder]:text-ink sm:w-auto sm:min-w-[150px]"
      >
        {icon ? <span className="text-plum-700">{icon}</span> : null}
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={className}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
