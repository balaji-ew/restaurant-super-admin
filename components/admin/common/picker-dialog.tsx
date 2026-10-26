'use client';

import { type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

/**
 * The console's modal shell: Cancel on the left, title centred, the confirming
 * action on the right.
 *
 * Every picker in the approved screens uses this bar — "Apply Modifier to
 * Items", "Modifier Type", "Add Variations", "Add Add-Ons". Putting Cancel at
 * the leading edge rather than beside the confirm is deliberate: the two
 * actions are opposites and a mis-tap between them is expensive on a touch
 * screen at a counter.
 */
export function PickerDialog({
  open,
  onOpenChange,
  title,
  confirmLabel = 'Done',
  onConfirm,
  confirmDisabled,
  cancelLabel = 'Cancel',
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmLabel?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        close={false}
        className={cn('gap-0 overflow-hidden p-0 sm:max-w-[560px]', className)}
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 cursor-pointer rounded-full border border-input bg-background px-6 text-sm font-medium text-ink transition-colors hover:bg-plum-tint"
          >
            {cancelLabel}
          </button>

          <DialogTitle className="flex-1 text-center text-lg font-semibold text-ink">
            {title}
          </DialogTitle>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="h-11 cursor-pointer rounded-full bg-plum-900 px-7 text-sm font-medium text-white transition-colors hover:bg-plum-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 pb-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The square check used down the right edge of every picker list.
 *
 * A styled box rather than the kit's Checkbox because the rows themselves are
 * the click target — the box is a state indicator, and making it separately
 * focusable would put two tab stops on one choice.
 */
export function PickerCheck({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-md border transition-colors',
        checked ? 'border-plum-900 bg-plum-900 text-white' : 'border-input bg-background',
      )}
    >
      {checked ? <Check className="size-4" strokeWidth={3} /> : null}
    </span>
  );
}

/** One selectable row in a picker list. */
export function PickerRow({
  title,
  subtitle,
  checked,
  onToggle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-4 border-b border-border px-1 py-4 text-left last:border-0"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-[13px] leading-snug text-violet-accent">
            {subtitle}
          </span>
        ) : null}
      </span>
      <PickerCheck checked={checked} />
    </button>
  );
}
