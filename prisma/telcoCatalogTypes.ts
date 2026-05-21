export type TelcoCatalogRow = {
  countryName: string;
  countryIso2: string;
  name: string;
  slug: string;
  telcoSubdomain: string;
  officialDomain: string | null;
  subscribers: number | null;
  subscribersDisplay: string | null;
};
