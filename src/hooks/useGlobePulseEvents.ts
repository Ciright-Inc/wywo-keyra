"use client";

import { useEffect, useState } from "react";
import type { GlobePulseEvent } from "@/lib/globe/types";

const FALLBACK_CITIES: { country: string; city: string; lat: number; lon: number }[] = [
  { country: "Germany", city: "Frankfurt", lat: 50.1109, lon: 8.6821 },
  { country: "United States", city: "New York", lat: 40.7128, lon: -74.006 },
  { country: "United Kingdom", city: "London", lat: 51.5074, lon: -0.1278 },
  { country: "France", city: "Paris", lat: 48.8566, lon: 2.3522 },
  { country: "Japan", city: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { country: "Australia", city: "Sydney", lat: -33.8688, lon: 151.2093 },
  { country: "Brazil", city: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { country: "South Africa", city: "Johannesburg", lat: -26.2041, lon: 28.0473 },
  { country: "United Arab Emirates", city: "Dubai", lat: 25.2048, lon: 55.2708 },
  { country: "India", city: "Delhi", lat: 28.6139, lon: 77.209 },
  { country: "Singapore", city: "Singapore", lat: 1.3521, lon: 103.8198 },
  { country: "Canada", city: "Toronto", lat: 43.6532, lon: -79.3832 },
];

const countryCoordsCache = new Map<string, { lat: number; lon: number }>();

for (const entry of FALLBACK_CITIES) {
  countryCoordsCache.set(entry.country.trim().toLowerCase(), { lat: entry.lat, lon: entry.lon });
}

async function coordsForCountry(countryName: string): Promise<{ lat: number; lon: number } | null> {
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

function buildFallbackEvents(): GlobePulseEvent[] {
  const protocols = ["SAT-ID", "SAT-IAM", "SAT-MFA", "SAT-SIG"];
  return FALLBACK_CITIES.map((entry, i) => ({
    id: `fallback-${i}`,
    country: entry.country,
    city: entry.city,
    latitude: entry.lat,
    longitude: entry.lon,
    roaming: i % 7 === 0,
    authType: "SAT",
    satModule: protocols[i % protocols.length],
    protocolCode: protocols[i % protocols.length],
  }));
}

async function fetchGlobeEvents(): Promise<GlobePulseEvent[]> {
  try {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/keyra/authentication-countries", { cache: "no-store" }),
      fetch("/api/keyra/sat-protocols", { cache: "no-store" }),
    ]);
    if (!cRes.ok || !pRes.ok) return buildFallbackEvents();

    const cJson = (await cRes.json()) as {
      countries?: { countryName: string; region: string; subRegion: string | null }[];
    };
    const pJson = (await pRes.json()) as {
      protocols?: { protocolCode: string; protocolName: string }[];
    };

    const countryList = cJson.countries ?? [];
    const protocols = pJson.protocols ?? [];
    if (!countryList.length) return buildFallbackEvents();

    const events: GlobePulseEvent[] = [];
    const limit = Math.min(24, countryList.length);

    for (let i = 0; i < limit; i += 1) {
      const country = countryList[i % countryList.length]!;
      const protocol = protocols[i % Math.max(protocols.length, 1)];
      const coords = await coordsForCountry(country.countryName);
      if (!coords) continue;

      const jitterLat = coords.lat + (Math.random() - 0.5) * 4;
      const jitterLon = coords.lon + (Math.random() - 0.5) * 6;

      events.push({
        id: `evt-${country.countryName}-${i}`,
        country: country.countryName,
        latitude: Math.max(-85, Math.min(85, jitterLat)),
        longitude: ((jitterLon + 180) % 360) - 180,
        roaming: i % 8 === 0,
        authType: "SAT",
        satModule: protocol?.protocolCode ?? "SAT-ID",
        protocolCode: protocol?.protocolCode ?? "SAT-ID",
      });
    }

    return events.length ? events : buildFallbackEvents();
  } catch {
    return buildFallbackEvents();
  }
}

export function useGlobePulseEvents() {
  const [events, setEvents] = useState<GlobePulseEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchGlobeEvents().then((pool) => {
      if (!cancelled) setEvents(pool);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return events;
}
