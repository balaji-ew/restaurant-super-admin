'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { staffAccountApi } from '@/lib/admin/api';
import { ActionButton } from '@/components/admin/common/buttons';
import { Field, FieldGrid, FormCard, TextInput } from '@/components/admin/common/form';
import { FormHeader } from '@/components/admin/common/page-header';
import { FormShell } from '@/components/admin/common/page-shell';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The signed-in user's own record.
 *
 * Separate from `/users/[id]` on purpose: editing yourself is a different act
 * from administering someone else, and the fields you may change about
 * yourself — name, contact, password — are not the fields an administrator
 * changes about you, which are role, scope and limits.
 */
export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? 'Administrator');
  const [email, setEmail] = useState(user?.email ?? 'admin@example.com');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [changing, setChanging] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  /**
   * Saves name, email, and phone for real.
   *
   * This used to just toast "Profile updated" with no request behind it, so
   * the change looked successful but never reached the server.
   */
  async function saveProfile() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter your name.';
    if (!email.trim()) {
      next.email = 'Enter your email.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    setErrors((current) => ({ ...current, ...next }));
    if (Object.keys(next).length > 0) return;

    setSavingProfile(true);
    try {
      await staffAccountApi.updateProfile(name.trim(), email.trim(), phone.trim());
      // Keeps the session's cached name/email in sync immediately, rather
      // than showing the old values until the next full sign-in refreshes it.
      await updateSession?.({ name: name.trim(), email: email.trim() });
    } catch (error) {
      // The server may object to the email specifically (e.g. already in
      // use) — surface that against the field, not just a general toast.
      const message = error instanceof Error ? error.message : 'The profile could not be updated.';
      setErrors((current) => ({ ...current, email: message }));
      toast.error(message);
      return;
    } finally {
      setSavingProfile(false);
    }

    toast.success('Profile updated');
  }

  /**
   * Changes the password for real.
   *
   * This used to validate the three boxes and then show a success toast
   * without calling anything — so the password never changed, and the person
   * who "changed" it found out at their next sign-in.
   */
  async function changePassword() {
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = 'Enter your current password.';
    if (newPassword.length < 12) {
      next.newPassword = 'Use at least 12 characters.';
    }
    if (newPassword !== confirmPassword) next.confirmPassword = 'The two passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setChanging(true);
    try {
      await staffAccountApi.changePassword(currentPassword, newPassword);
    } catch (error) {
      // The server names the field it objected to — a wrong current password
      // belongs against that box, not in a general banner.
      const message = error instanceof Error ? error.message : 'The password could not be changed.';
      setErrors({ currentPassword: message });
      toast.error(message);
      return;
    } finally {
      setChanging(false);
    }

    toast.success('Password changed. Use it the next time you sign in.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <FormShell>
      <FormHeader
        title="My profile"
        onBack={() => router.push('/dashboard')}
        actions={
          <ActionButton
            icon={<Save className="size-4" />}
            onClick={() => void saveProfile()}
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving…' : 'Save changes'}
          </ActionButton>
        }
      />

      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <FormCard title="Details" className="p-0">
          <div className="flex flex-col gap-5 p-5">
            <Field label="Name" htmlFor="profile-name" error={errors.name}>
              <TextInput
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                invalid={Boolean(errors.name)}
              />
            </Field>
            <Field label="Email" htmlFor="profile-email" error={errors.email}>
              <TextInput
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                invalid={Boolean(errors.email)}
              />
            </Field>
            <Field label="Mobile" htmlFor="profile-phone">
              <TextInput
                id="profile-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 732 555 0100"
              />
            </Field>
            <Field label="Role">
              <TextInput
                value={user?.role ?? 'Super Admin'}
                readOnly
                aria-label="Role"
                className="bg-muted/50"
              />
            </Field>
          </div>
        </FormCard>

        <FormCard title="Password" className="p-0">
          <div className="flex flex-col gap-5 p-5">
            <Field
              label="Current password"
              htmlFor="current-password"
              error={errors.currentPassword}
            >
              <TextInput
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                invalid={Boolean(errors.currentPassword)}
              />
            </Field>
            <FieldGrid>
              <Field label="New password" htmlFor="new-password" error={errors.newPassword}>
                <TextInput
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  invalid={Boolean(errors.newPassword)}
                />
              </Field>
              <Field label="Confirm" htmlFor="confirm-password" error={errors.confirmPassword}>
                <TextInput
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  invalid={Boolean(errors.confirmPassword)}
                />
              </Field>
            </FieldGrid>
            <ActionButton
              tone="outline"
              icon={<KeyRound className="size-4" />}
              className="self-start"
              onClick={changePassword}
              disabled={changing}
            >
              Change password
            </ActionButton>
          </div>
        </FormCard>
      </div>
    </FormShell>
  );
}
