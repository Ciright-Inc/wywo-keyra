"use client";

import { useCallback, useEffect, useState } from "react";

type ActiveCountry = {
  iso2: string;
  countryName: string;
  region: string;
  subRegion: string | null;
  flagEmoji: string | null;
};

export function ActiveAuthenticationCountriesWidget() {
  const [countries, setCountries] = useState<ActiveCountry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/keyra/authentication-countries", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { countries?: ActiveCountry[] };
      setCountries(Array.isArray(data.countries) ? data.countries : []);
    } catch {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return (
    <div className="mt-3 max-h-36 space-y-2.5 overflow-y-auto pr-1">
      {loading ? (
        <p className="text-[12px] text-slate-400">Loading…</p>
      ) : countries.length === 0 ? (
        <p className="text-[12px] text-slate-400">No active countries</p>
      ) : (
        countries.map((country) => (
          <div key={country.iso2} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[12px] text-slate-500">
              {country.countryName} • {(country.subRegion?.trim() || country.region).trim()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
