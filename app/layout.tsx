import { Toaster } from '@/components/ui/sonner';
import '@/css/styles.css';
import { Suspense, type ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { TooltipsProvider } from '@/providers/tooltips-provider';

/**
 * Poppins is the face the approved admin screens are drawn in.
 *
 * Published as `--face-poppins` rather than as a class on `<body>`: the
 * default family is set once in `css/styles.css` from the `--font-sans` token,
 * so there is exactly one place it lives and no chance of a second face
 * silently becoming the default by being added to the tree.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--face-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s · Admin Portal',
    default: 'Admin Portal',
  },
  description: 'Clean, modern, and extensible admin console template.',
};

/**
 * `maximumScale` is deliberately absent. Pinch-zoom must never be disabled —
 * it is the accessibility failure the competitor analysis singles out
 * (SF-37 / NFR-09), and it costs older staff on shop-floor tablets the most.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full ${poppins.variable}`} suppressHydrationWarning>
      <body
        className="flex h-full flex-col bg-shell text-base text-ink antialiased"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <TooltipsProvider>
              <Suspense>{children}</Suspense>
              <Toaster position="top-right" />
            </TooltipsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
