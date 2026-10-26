'use client';

/**
 * The full-screen hold shown while the session is being resolved.
 *
 * The wordmark rather than a spinner alone: this is the first thing a signed-
 * out visitor sees, and a bare spinner on a white page gives no signal about
 * what is loading or whether it is the right application.
 */
export function ScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background"
    >
      <span
        role="img"
        aria-label="Baked Bouquet"
        className="block h-[38px] w-[160px] bg-plum-900"
        style={{
          maskImage: 'url(/images/logo-mask.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/images/logo-mask.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
      <span className="size-5 animate-spin rounded-full border-2 border-plum-tint-strong border-t-plum-900" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
