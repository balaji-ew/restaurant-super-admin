'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe2, Mail, Pencil, Phone, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { countriesApi, type Country, type CountryInput } from '@/lib/admin/countries-api';
import { useCountries } from '@/hooks/use-countries';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ActionButton } from '@/components/admin/common/buttons';
import { DataTable, RowActions, type Column } from '@/components/admin/common/data-table';
import { PageHeader } from '@/components/admin/common/page-header';
import { ListBody, PageShell } from '@/components/admin/common/page-shell';
import { paginate, Pagination } from '@/components/admin/common/pagination';
import { SearchField, Toolbar } from '@/components/admin/common/toolbar';
import { CountrySheet } from '@/components/admin/country/country-sheet';

export default function CountriesPage() {
  const queryClient = useQueryClient();
  const countries = useCountries();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const saveCountry = useMutation({
    mutationFn: ({ input, id }: { input: CountryInput; id?: string }) =>
      countriesApi.save(input, id),
    onSuccess: async (country, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['countries'] });
      toast.success(
        variables.id ? `${country.countryName} updated` : `${country.countryName} created`,
      );
      setSheetOpen(false);
      setEditingCountry(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'The country could not be saved.');
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter((country) =>
      [
        country.countryName,
        country.countryCode,
        country.currencyCode,
        country.supportEmail,
        country.supportMobile,
        country.websiteUrl,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [countries, search]);

  const rows = paginate(filtered, page, perPage);

  const columns: Column<Country>[] = [
    {
      key: 'country',
      header: 'Country',
      className: 'w-[220px]',
      cell: (row) => (
        <span className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-plum-tint text-plum-900">
            <Globe2 className="size-4.5" />
          </span>
          <span>
            <span className="block font-medium">{row.countryName}</span>
            <span className="mt-0.5 block text-xs text-ink-subtle">{row.countryCode}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'currency',
      header: 'Currency',
      className: 'w-[150px]',
      cell: (row) => (
        <span className="text-ink-muted">
          {row.currencySymbol} <span className="font-medium text-ink">{row.currencyCode}</span>
        </span>
      ),
    },
    {
      key: 'supportEmail',
      header: 'Support Email',
      className: 'w-[220px]',
      cell: (row) => (
        <span className="flex items-center gap-2 text-ink-muted">
          <Mail className="size-4 shrink-0 text-ink-subtle" />
          <span className="truncate">{row.supportEmail || '—'}</span>
        </span>
      ),
    },
    {
      key: 'supportMobile',
      header: 'Support Mobile',
      className: 'w-[180px]',
      cell: (row) => (
        <span className="flex items-center gap-2 text-ink-muted">
          <Phone className="size-4 shrink-0 text-ink-subtle" />
          {row.supportMobile || '—'}
        </span>
      ),
    },
    {
      key: 'website',
      header: 'Website URL',
      className: 'w-[190px]',
      cell: (row) =>
        row.websiteUrl ? (
          <a
            href={row.websiteUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="text-violet-accent hover:underline"
          >
            {row.websiteUrl.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-ink-subtle">—</span>
        ),
    },
    {
      key: 'actions',
      header: <span className="block text-right">Action</span>,
      className: 'w-[80px] text-right',
      cell: (row) => (
        <div className="flex justify-end">
          <RowActions>
            <DropdownMenuItem
              onClick={() => {
                setEditingCountry(row);
                setSheetOpen(true);
              }}
            >
              <Pencil className="size-4" /> Edit country
            </DropdownMenuItem>
          </RowActions>
        </div>
      ),
    },
  ];

  function openCreateSheet() {
    setEditingCountry(null);
    setSheetOpen(true);
  }

  return (
    <PageShell>
      <PageHeader
        title="Countries"
        crumbs={[
          { label: 'Business Management', href: '/business-management' },
          { label: 'Countries' },
        ]}
        actions={
          <ActionButton icon={<Plus className="size-4" />} onClick={openCreateSheet}>
            Create country
          </ActionButton>
        }
      />

      <Toolbar>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Country name or code"
        />
      </Toolbar>

      <ListBody>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            setEditingCountry(row);
            setSheetOpen(true);
          }}
          empty={search ? 'No countries match your search.' : 'No countries have been added yet.'}
        />
      </ListBody>

      <Pagination
        page={page}
        perPage={perPage}
        total={filtered.length}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
      />

      <CountrySheet
        key={editingCountry?.id ?? 'new-country'}
        open={sheetOpen}
        country={editingCountry}
        saving={saveCountry.isPending}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingCountry(null);
        }}
        onSave={(input) => saveCountry.mutate({ input, id: editingCountry?.id })}
      />
    </PageShell>
  );
}
