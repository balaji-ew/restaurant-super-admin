'use client';

import { useQuery } from '@tanstack/react-query';
import { countriesApi, type Country } from '@/lib/admin/countries-api';

const EMPTY_COUNTRIES: Country[] = [];

export function useCountries(): Country[] {
  const { data } = useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.list,
  });

  return data ?? EMPTY_COUNTRIES;
}
