'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { ActionButton } from '@/components/admin/common/buttons';
import { Field, FieldGrid, FormCard, TextInput } from '@/components/admin/common/form';
import { PageHeader } from '@/components/admin/common/page-header';
import { PageShell } from '@/components/admin/common/page-shell';

export default function SettingsPage() {
  const [appName, setAppName] = useState('Admin Portal');
  const [supportEmail, setSupportEmail] = useState('support@example.com');
  const [supportPhone, setSupportPhone] = useState('+1 (555) 000-0000');
  const [currency, setCurrency] = useState('USD');

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    toast.success('Settings updated successfully.');
  }

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        crumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
        actions={
          <ActionButton
            icon={<Save className="size-4" />}
            onClick={handleSave}
          >
            Save changes
          </ActionButton>
        }
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <FormCard title="General Configuration">
          <div className="flex flex-col gap-5 p-5">
            <Field label="Application name" htmlFor="app-name" required>
              <TextInput
                id="app-name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </Field>

            <FieldGrid>
              <Field label="Support email" htmlFor="support-email">
                <TextInput
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </Field>

              <Field label="Support phone" htmlFor="support-phone">
                <TextInput
                  id="support-phone"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                />
              </Field>
            </FieldGrid>

            <Field label="Default currency" htmlFor="currency">
              <TextInput
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </Field>
          </div>
        </FormCard>

        <div className="flex flex-col gap-6">
          <FormCard title="Account & Security">
            <div className="flex flex-col gap-4 p-5">
              <p className="text-sm text-ink-muted">
                Manage your personal credentials, contact details, and password.
              </p>

              <Link
                href="/settings/profile"
                className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-plum-tint/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-plum-tint text-plum-900">
                    <User className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">My Profile</h3>
                    <p className="text-xs text-ink-muted">Update your name, email, and password</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-ink-subtle" />
              </Link>
            </div>
          </FormCard>

          <FormCard title="System Information">
            <div className="flex flex-col gap-3 p-5 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-muted">Environment</span>
                <span className="font-medium text-ink">{process.env.NODE_ENV ?? 'development'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-muted">Framework</span>
                <span className="font-medium text-ink">Next.js 15 (App Router)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Session Strategy</span>
                <span className="font-medium text-ink">NextAuth.js JWT</span>
              </div>
            </div>
          </FormCard>
        </div>
      </form>
    </PageShell>
  );
}
