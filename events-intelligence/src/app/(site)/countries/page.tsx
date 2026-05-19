import Link from "next/link";
import { getCountriesWithCounts } from "@/lib/data/events";

export default async function CountriesPage() {
  const rows = await getCountriesWithCounts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted-2)]">Country directory</p>
      <h1 className="mt-3 text-4xl font-light text-[var(--fg)]">Countries & territories</h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        Drill down after geopolitical region — each row opens the public catalogue filtered by host country.
      </p>
      <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <li key={r.country}>
            <Link
              href={`/events?country=${encodeURIComponent(r.country)}`}
              className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--elevated)] px-4 py-3 text-sm transition hover:border-[var(--fg)]"
            >
              <span className="font-medium text-[var(--fg)]">{r.country}</span>
              <span className="text-xs text-[var(--muted)]">{r.count} events</span>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No approved catalogue rows yet.</p>
      ) : null}
      <p className="mt-12 text-sm">
        <Link href="/regions" className="underline-offset-4 hover:underline">
          ← Regions
        </Link>
      </p>
    </div>
  );
}
