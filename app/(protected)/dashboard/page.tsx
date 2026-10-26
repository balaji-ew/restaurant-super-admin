'use client';

import { useSession } from 'next-auth/react';
import { Activity, CheckCircle2, Layers, Server, Shield } from 'lucide-react';
import { PageHeader } from '@/components/admin/common/page-header';
import { PageShell } from '@/components/admin/common/page-shell';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Administrator';

  const metrics = [
    {
      title: 'Authentication Status',
      value: 'Active',
      subtext: 'NextAuth JWT session verified',
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Event Stream (SSE)',
      value: 'Connected',
      subtext: 'Live query invalidation ready',
      icon: Activity,
      color: 'text-violet-accent bg-plum-tint',
    },
    {
      title: 'State & Query Cache',
      value: 'Synchronized',
      subtext: 'TanStack React Query store',
      icon: Layers,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'API Infrastructure',
      value: 'Configured',
      subtext: 'Axios interceptors & error handler',
      icon: Server,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        crumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
      />

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-plum-900 to-plum-800 p-6 text-white shadow-lg lg:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <CheckCircle2 className="size-3.5 text-emerald-400" /> Template Ready
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            Your clean, modular admin portal template is ready for development. The core infrastructure,
            NextAuth authentication flow, Server-Sent Events, and shared layout systems are intact.
          </p>
        </div>
      </div>

      {/* Core Infrastructure Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-xl border border-border bg-background p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-muted">{item.title}</span>
                <div className={`grid size-9 place-items-center rounded-lg ${item.color}`}>
                  <Icon className="size-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-ink">{item.value}</span>
                <p className="mt-1 text-xs text-ink-subtle">{item.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Starter Guide Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-6 shadow-xs">
          <h2 className="text-base font-semibold text-ink">Template Foundation</h2>
          <p className="mt-1 text-sm text-ink-muted">
            The following foundational modules and architectures are available out of the box:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                <strong className="text-ink">Authentication & Sessions:</strong> Complete NextAuth.js
                credential provider, token rotation, route guards, and session refresh.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                <strong className="text-ink">Real-time SSE:</strong> EventSource connection with token
                propagation and automated cache invalidation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                <strong className="text-ink">Shared UI & Design System:</strong> 70+ components, data
                tables, forms, dialogs, drawers, and responsive sidebar navigation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                <strong className="text-ink">API Client & Error Handling:</strong> Centralized Axios
                interceptors with standardized error envelopes.
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-background p-6 shadow-xs">
          <h2 className="text-base font-semibold text-ink">Adding New Modules</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Follow this recommended workflow to build new features:
          </p>
          <ol className="mt-4 list-decimal space-y-2.5 ps-4 text-sm text-ink-muted">
            <li>
              Define your types in <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">types/</code> or <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">lib/admin/types.ts</code>.
            </li>
            <li>
              Add API calls to <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">lib/admin/api.ts</code>.
            </li>
            <li>
              Create page routes under <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">app/(protected)/your-feature</code>.
            </li>
            <li>
              Register navigation links in <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">config/menu.config.tsx</code>.
            </li>
            <li>
              Optionally register SSE event invalidation keys in <code className="rounded bg-plum-tint px-1.5 py-0.5 text-xs text-plum-900">live-updates.tsx</code>.
            </li>
          </ol>
        </div>
      </div>
    </PageShell>
  );
}
