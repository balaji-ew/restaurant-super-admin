'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useBodyClass } from '@/hooks/use-body-class';
import { ScopeProvider } from '@/providers/scope-provider';
import { ViewerProvider } from '@/providers/viewer-provider';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Header } from '@/components/admin/layout/header';
import { Sidebar } from '@/components/admin/layout/sidebar';
import { ScreenLoader } from '@/components/common/screen-loader';
import { LiveUpdates } from '@/components/admin/layout/live-updates';

/**
 * The signed-in shell: fixed sidebar, fixed header, one scrolling content
 * column between them.
 *
 * Only the content scrolls. On a list of two hundred orders the manager still
 * has the outlet switcher and the nav where they were, which is the difference
 * between answering the phone in ten seconds and scrolling back up first.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useBodyClass('[--header-height:76px] [--sidebar-width:248px] lg:overflow-hidden');

  useEffect(() => {
    if (status === 'unauthenticated') {
     // router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // A refresh that cannot be completed means the session is genuinely gone;
  // holding a dead token would leave every request failing with no explanation.
  useEffect(() => {
    if ((session as { error?: string } | null)?.error === 'RefreshAccessTokenError') {
      void signOut({ redirect: false }).then(() => router.replace('/signin'));
    }
  }, [session, router]);

  // Close the drawer on navigation — otherwise tapping a link on mobile loads
  // the page behind a nav that is still covering it.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return <ScreenLoader />;
  }

  return (
    <ViewerProvider>
      <ScopeProvider>
      {/* Refreshes lists and records when something changes elsewhere. */}
      <LiveUpdates />
      <div className="flex h-full min-h-0 w-full">
        <Sidebar className="hidden lg:flex" />

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-(--sidebar-width) p-0" close={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar className="w-full border-r-0" />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenSidebar={() => setMobileNavOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto bg-shell p-4 lg:p-6">{children}</main>
        </div>
      </div>
      </ScopeProvider>
    </ViewerProvider>
  );
}
