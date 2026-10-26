'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Menu, Settings as SettingsIcon, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();

  const user = (session?.user ?? {}) as { name?: string; email?: string; role?: string };
  const name = user.name ?? 'Administrator';
  const role = user.role ?? 'Super Admin';
  const email = user.email ?? 'admin@example.com';

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-muted hover:bg-plum-tint lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="ms-auto flex items-center gap-3 lg:gap-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-3 rounded-full pe-1 text-left"
            >
              <Avatar name={name} />
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-semibold text-ink">{name}</span>
                <span className="block text-xs text-ink-subtle">{role}</span>
              </span>
              <ChevronDown className="hidden size-4 text-ink-subtle sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-ink-subtle">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <User className="size-4" /> My profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon className="size-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                void signOut({ redirect: false }).then(() => router.push('/signin'));
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/**
 * User avatar displaying initials.
 */
function Avatar({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'A';

  return (
    <span
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-plum-900 text-sm font-semibold text-white',
        className,
      )}
      aria-hidden
    >
      {letters}
    </span>
  );
}
