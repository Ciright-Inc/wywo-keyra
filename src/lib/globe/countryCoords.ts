const FALLBACK_CITIES: { country: string; lat: number; lon: number }[] = [
  { country: "Germany", lat: 50.1109, lon: 8.6821 },
  { country: "United States", lat: 40.7128, lon: -74.006 },
  { country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { country: "France", lat: 48.8566, lon: 2.3522 },
  { country: "Japan", lat: 35.6762, lon: 139.6503 },
  { country: "Australia", lat: -33.8688, lon: 151.2093 },
  { country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { country: "India", lat: 28.6139, lon: 77.209 },
  { country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { country: "Canada", lat: 43.6532, lon: -79.3832 },
];

const countryCoordsCache = new Map<string, { lat: number; lon: number }>();

for (const entry of FALLBACK_CITIES) {
  countryCoordsCache.set(entry.country.trim().toLowerCase(), { lat: entry.lat, lon: entry.lon });
}

/** Resolve country name to representative lat/lon (capital region or catalog centroid). */
export async function coordsForCountry(
  countryName: string,
): Promise<{ lat: number; lon: number } | null> {
  const key = countryName.trim().toLowerCase();
  if (countryCoordsCache.has(key)) return countryCoordsCache.get(key)!;

  const { default: countries } = await import("world-countries");
  const match = countries.find(
    (c) =>
      c.name.common.toLowerCase() === key ||
      c.name.official.toLowerCase() === key ||
      c.altSpellings.some((s) => s.toLowerCase() === key),
  );
  if (match?.latlng?.length === 2) {
    const coords = { lat: match.latlng[0]!, lon: match.latlng[1]! };
    countryCoordsCache.set(key, coords);
    return coords;
  }
  return null;
}
