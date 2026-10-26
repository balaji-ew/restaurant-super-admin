'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * A bordered panel. Every form on the console is a stack of these — the panel
 * is what groups fields into a decision rather than a wall of inputs.
 */
export function FormCard({
  children,
  className,
  title,
  action,
}: {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn('rounded-xl border border-input bg-background', className)}>
      {title || action ? (
        <header className="flex items-center justify-between gap-4 px-5 pt-5">
          {typeof title === 'string' ? (
            <h2 className="text-base font-semibold text-ink">{title}</h2>
          ) : (
            title
          )}
          {action}
        </header>
      ) : null}
      {children ? <div className="p-5">{children}</div> : null}
    </section>
  );
}

/**
 * A card whose whole header is a labelled switch — "Active Dates",
 * "Visibility & scheduling", "Set a minimum order amount".
 *
 * The body is unmounted rather than hidden when the switch is off, so a
 * disabled section can not submit stale values it is no longer showing.
 */
export function ToggleCard({
  label,
  description,
  enabled,
  onToggle,
  children,
  className,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-input bg-background', className)}>
      <header
        className={cn(
          'flex items-center justify-between gap-4 px-5 py-4',
          enabled && children ? 'border-b border-border' : '',
        )}
      >
        <div>
          <p className="text-[15px] font-medium text-ink">{label}</p>
          {description ? <p className="mt-0.5 text-xs text-ink-subtle">{description}</p> : null}
        </div>
        <SectionSwitch checked={enabled} onChange={onToggle} ariaLabel={label} />
      </header>
      {enabled && children ? <div className="p-5">{children}</div> : null}
    </section>
  );
}

function SectionSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-plum-900' : 'bg-zinc-200',
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

/**
 * Label, control, and the two things that go under it.
 *
 * `error` renders in place of `hint` — showing both at once means the message
 * that matters competes with the one that does not.
 */
export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="ms-0.5 text-red-500" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

/** The console's text input. One height, one radius, one focus treatment. */
export function TextInput({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-ink outline-none transition-colors',
        'placeholder:text-ink-subtle focus-visible:border-plum-700',
        invalid && 'border-red-400 focus-visible:border-red-500',
        className,
      )}
    />
  );
}

/**
 * A text input with a fixed unit sitting inside it — the `$` on every money
 * field. Not a prefix inside the value: the input stays a plain number so it
 * can be parsed without stripping decoration.
 */
export function AddonInput({
  addon,
  addonPosition = 'end',
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  addon: ReactNode;
  addonPosition?: 'start' | 'end';
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-12 w-full items-center rounded-xl border border-input bg-background transition-colors focus-within:border-plum-700',
        invalid && 'border-red-400',
        className,
      )}
    >
      {addonPosition === 'start' ? (
        <span className="ps-4 text-sm text-ink-subtle">{addon}</span>
      ) : null}
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-ink-subtle"
      />
      {addonPosition === 'end' ? (
        <span className="pe-4 text-sm text-ink-subtle">{addon}</span>
      ) : null}
    </div>
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[92px] w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-ink outline-none transition-colors',
        'placeholder:text-ink-subtle focus-visible:border-plum-700',
        className,
      )}
    />
  );
}

/**
 * A native date input styled to match.
 *
 * Native rather than a picker component so the field is keyboard-enterable and
 * respects the operating system's locale — a manager typing 12/09 should not
 * have to reach for a mouse to open a calendar.
 */
/**
 * A date *and* a time.
 *
 * Scheduling needs both: "on sale from Friday" and "on sale from 9am Friday"
 * are different instructions, and only one of them can be given with a date
 * alone. The column has always been a timestamp — this is what lets somebody
 * set the other half of it.
 */
export function DateTimeInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="datetime-local"
      className={cn(
        'h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-ink outline-none transition-colors',
        'focus-visible:border-plum-700 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
        className,
      )}
    />
  );
}

export function DateInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="date"
      className={cn(
        'h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-ink outline-none transition-colors',
        'focus-visible:border-plum-700 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
        className,
      )}
    />
  );
}

/**
 * A select matched to `TextInput`'s height and radius.
 *
 * Wraps the kit's Select rather than a native `<select>` so the open list is
 * styled consistently with the rest of the console, and takes options as data
 * so a caller never has to import four primitives to render one field.
 */
export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  invalid,
  disabled,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-12 w-full rounded-xl px-4 text-sm',
          invalid && 'border-red-400',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Two-column grid on desktop, single column on mobile. */
export function FieldGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
