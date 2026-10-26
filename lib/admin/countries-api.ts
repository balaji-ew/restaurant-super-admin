import { MOCK_COUNTRIES } from './country-mock-data';

export interface Country {
  id: string;
  countryName: string;
  countryCode: string;
  currencySymbol: string;
  currencyCode: string;
  supportEmail: string;
  supportMobile: string;
  websiteUrl: string;
}

export type CountryInput = Omit<Country, 'id'>;

let countries = MOCK_COUNTRIES.map((country) => ({ ...country }));

/**
 * Mock API for the country module. Replace these methods with the country
 * endpoints when they are available; the page can continue using this API.
 */
export const countriesApi = {
  list: async (): Promise<Country[]> => countries.map((country) => ({ ...country })),

  save: async (input: CountryInput, id?: string): Promise<Country> => {
    const countryCode = input.countryCode.trim().toUpperCase();
    const duplicate = countries.find(
      (country) => country.countryCode === countryCode && country.id !== id,
    );
    if (duplicate) {
      throw new Error(`A country with code ${countryCode} already exists.`);
    }

    const country: Country = {
      ...input,
      id: id ?? `country_${countryCode.toLowerCase()}_${Date.now()}`,
      countryName: input.countryName.trim(),
      countryCode,
      currencySymbol: input.currencySymbol.trim(),
      currencyCode: input.currencyCode.trim().toUpperCase(),
      supportEmail: input.supportEmail.trim(),
      supportMobile: input.supportMobile.trim(),
      websiteUrl: input.websiteUrl.trim(),
    };

    if (id) {
      countries = countries.map((existing) => (existing.id === id ? country : existing));
    } else {
      countries = [country, ...countries];
    }

    return { ...country };
  },
};
