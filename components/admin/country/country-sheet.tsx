'use client';

import { useState, type FormEvent } from 'react';
import type { Country, CountryInput } from '@/lib/admin/countries-api';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ActionButton } from '@/components/admin/common/buttons';
import { Field, TextInput } from '@/components/admin/common/form';

const INITIAL_FORM: CountryInput = {
  countryName: '',
  countryCode: '',
  currencySymbol: '',
  currencyCode: '',
  supportEmail: '',
  supportMobile: '',
  websiteUrl: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CountrySheet({
  open,
  country,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  country: Country | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CountryInput) => void;
}) {
  const [form, setForm] = useState<CountryInput>(country ?? INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CountryInput, string>>>({});
  const isEditing = country !== null;

  function updateField(field: keyof CountryInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof CountryInput, string>> = {};
    if (!form.countryName.trim()) nextErrors.countryName = 'Enter a country name.';
    if (!form.countryCode.trim()) nextErrors.countryCode = 'Enter a country code.';
    if (!form.currencySymbol.trim()) nextErrors.currencySymbol = 'Enter a currency symbol.';
    if (!form.currencyCode.trim()) nextErrors.currencyCode = 'Enter a currency code.';
    if (form.supportEmail && !EMAIL_PATTERN.test(form.supportEmail.trim())) {
      nextErrors.supportEmail = 'Enter a valid email address.';
    }
    if (form.websiteUrl && !/^https?:\/\/\S+\.\S+/i.test(form.websiteUrl.trim())) {
      nextErrors.websiteUrl = 'Enter a valid URL starting with http:// or https://.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...form,
      countryName: form.countryName.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
      currencySymbol: form.currencySymbol.trim(),
      currencyCode: form.currencyCode.trim().toUpperCase(),
      supportEmail: form.supportEmail.trim(),
      supportMobile: form.supportMobile.trim(),
      websiteUrl: form.websiteUrl.trim(),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <header className="border-b border-border px-6 py-5">
          <SheetTitle className="text-xl text-ink">
            {isEditing ? 'Edit country' : 'Create country'}
          </SheetTitle>
          <SheetDescription className="mt-1">
            {isEditing
              ? 'Update the country and its support details.'
              : 'Add a country and its currency and support details.'}
          </SheetDescription>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Country Name"
                htmlFor="country-name"
                required
                error={errors.countryName}
              >
                <TextInput
                  id="country-name"
                  autoComplete="country-name"
                  value={form.countryName}
                  onChange={(event) => updateField('countryName', event.target.value)}
                  placeholder="e.g. United States"
                  required
                />
              </Field>
              <Field
                label="Country Code"
                htmlFor="country-code"
                required
                error={errors.countryCode}
              >
                <TextInput
                  id="country-code"
                  value={form.countryCode}
                  onChange={(event) =>
                    updateField('countryCode', event.target.value.toUpperCase().slice(0, 3))
                  }
                  placeholder="e.g. US"
                  maxLength={3}
                  required
                />
              </Field>
              <Field
                label="Currency Symbol"
                htmlFor="currency-symbol"
                required
                error={errors.currencySymbol}
              >
                <TextInput
                  id="currency-symbol"
                  value={form.currencySymbol}
                  onChange={(event) => updateField('currencySymbol', event.target.value)}
                  placeholder="e.g. $"
                  required
                />
              </Field>
              <Field
                label="Currency Code"
                htmlFor="currency-code"
                required
                error={errors.currencyCode}
              >
                <TextInput
                  id="currency-code"
                  value={form.currencyCode}
                  onChange={(event) =>
                    updateField('currencyCode', event.target.value.toUpperCase().slice(0, 3))
                  }
                  placeholder="e.g. USD"
                  maxLength={3}
                  required
                />
              </Field>
            </div>

            <Field label="Support Email" htmlFor="support-email" error={errors.supportEmail}>
              <TextInput
                id="support-email"
                type="email"
                autoComplete="email"
                value={form.supportEmail}
                onChange={(event) => updateField('supportEmail', event.target.value)}
                placeholder="support@example.com"
              />
            </Field>

            <Field label="Support Mobile" htmlFor="support-mobile">
              <TextInput
                id="support-mobile"
                type="tel"
                autoComplete="tel"
                value={form.supportMobile}
                onChange={(event) => updateField('supportMobile', event.target.value)}
                placeholder="+1 212 555 0100"
              />
            </Field>

            <Field label="Website URL" htmlFor="website-url" error={errors.websiteUrl}>
              <TextInput
                id="website-url"
                type="url"
                autoComplete="url"
                value={form.websiteUrl}
                onChange={(event) => updateField('websiteUrl', event.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          </div>

          <footer className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <ActionButton tone="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create country'}
            </ActionButton>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
