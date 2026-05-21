export function telcoSubdomainFromCountry(
  countrySubdomain: string,
  telcoSlug: string,
): string {
  return `${telcoSlug.trim().toLowerCase()}.${countrySubdomain.trim().toLowerCase()}`;
}
