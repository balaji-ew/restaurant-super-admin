'use client';

import * as React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toast notifications.
 *
 * Pinned to the light theme rather than reading one from next-themes. The
 * console is a light-only design — plum on white, no dark palette anywhere —
 * and there is no ThemeProvider mounted, so asking for the theme returned
 * "system". On a machine set to dark that rendered a black toast carrying
 * text coloured for a white one: an unreadable dark-grey message on black.
 *
 * The colours are the console's own tokens rather than sonner's defaults, and
 * each kind of message is coloured by what it is — green for something that
 * worked, red for something that failed, plum for a plain statement — with an
 * icon beside it, because colour alone is never the signal (WCAG 1.4.1).
 */
const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      className="toaster"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-xl border shadow-lg bg-background text-ink border-border ' +
            'data-[type=success]:bg-emerald-50 data-[type=success]:border-emerald-200 ' +
            'data-[type=error]:bg-red-50 data-[type=error]:border-red-200 ' +
            'data-[type=warning]:bg-amber-50 data-[type=warning]:border-amber-200 ' +
            'data-[type=info]:bg-plum-tint data-[type=info]:border-plum-tint-strong',
          title:
            'text-sm font-medium text-ink ' +
            'group-data-[type=success]:text-emerald-800 ' +
            'group-data-[type=error]:text-red-800 ' +
            'group-data-[type=warning]:text-amber-900 ' +
            'group-data-[type=info]:text-plum-900',
          description:
            'text-[13px] text-ink-muted ' +
            'group-data-[type=success]:text-emerald-700 ' +
            'group-data-[type=error]:text-red-700 ' +
            'group-data-[type=warning]:text-amber-800 ' +
            'group-data-[type=info]:text-plum-800',
          icon:
            'group-data-[type=success]:text-emerald-600 ' +
            'group-data-[type=error]:text-red-600 ' +
            'group-data-[type=warning]:text-amber-600 ' +
            'group-data-[type=info]:text-plum-800',
          closeButton: 'bg-background text-ink-muted border-border hover:bg-plum-tint',
          actionButton: 'rounded-lg! bg-plum-900 text-white!',
          cancelButton: 'rounded-lg! bg-plum-tint text-plum-900!',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
