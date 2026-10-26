'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { cn } from '@/lib/utils';
import { useViewer } from '@/providers/viewer-provider';

/**
 * The console's left navigation rail.
 *
 * Provides a fixed sidebar for fast navigation across admin features.
 */
export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const viewer = useViewer();

  /*
   * Filter menu items based on the signed-in user's permissions.
   */
  const items = MENU_SIDEBAR.filter((item) => !item.permission || viewer.can(item.permission));
  const menu = items.filter((item, index) => {
    if (!item.heading) return true;
    const next = items[index + 1];
    return Boolean(next && !next.heading);
  });

  return (
    <aside
      className={cn(
        'flex w-(--sidebar-width) shrink-0 flex-col border-r border-border bg-background',
        className,
      )}
    >
      <div className="flex h-(--header-height) shrink-0 items-center px-6">
        <Link href="/dashboard" aria-label="Admin Portal Dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-plum-900 text-white">
            <Shield className="size-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-ink">
            Admin<span className="text-violet-accent">Console</span>
          </span>
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        <ul className="flex flex-col gap-0.5">
          {menu.map((item, index) => {
            if (item.heading) {
              return (
                <li
                  key={`heading-${item.heading}`}
                  className={cn(
                    'px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle',
                    index === 0 ? 'pt-2' : 'pt-6',
                  )}
                >
                  {item.heading}
                </li>
              );
            }

            const active = isActive(pathname, item.path, item.match);

            return (
              <li key={item.path}>
                <Link
                  href={item.path ?? '#'}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-plum-900 text-white'
                      : 'text-ink-muted hover:bg-plum-tint hover:text-plum-900',
                  )}
                >
                  {typeof item.icon === 'string' ? (
                    <span
                      aria-hidden
                      className="block size-[18px] shrink-0 bg-current"
                      style={{
                        maskImage: `url(${item.icon})`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskImage: `url(${item.icon})`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                      }}
                    />
                  ) : item.icon ? (
                    <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                  ) : null}
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

/**
 * Checks whether a nav item owns the current route.
 */
function isActive(pathname: string, path?: string, extra?: string[]): boolean {
  const candidates = [path, ...(extra ?? [])].filter(Boolean) as string[];
  return candidates.some(
    (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`),
  );
}
