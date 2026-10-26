'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Field, TextInput } from '@/components/admin/common/form';

/**
 * Staff sign-in page.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      setError(
        result?.error ||
          'Those details were not recognised. Check the email and password and try again.',
      );
      setSubmitting(false);
      return;
    }

    const next = searchParams.get('next');
    router.replace(next?.startsWith('/') ? next : '/dashboard');
  }

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-background p-8 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-plum-900 text-white shadow-md">
          <Shield className="size-7" />
        </div>
        <h1 className="mt-3 text-xl font-semibold text-ink">Welcome to Admin Portal</h1>
        <p className="text-sm text-ink-muted">Sign in to access your secure admin console</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Field label="Email" htmlFor="email" required>
          <TextInput
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            invalid={Boolean(error)}
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <div className="relative">
            <TextInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="pe-12"
              invalid={Boolean(error)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute end-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-ink-subtle hover:bg-plum-tint"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-plum-900 text-sm font-medium text-white transition-colors hover:bg-plum-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}
