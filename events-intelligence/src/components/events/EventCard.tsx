import Link from "next/link";
import { CONTINENT_LABELS, INDUSTRY_LABELS, REGION_LABELS, TIER_LABELS } from "@/lib/constants";
import type { EventPayload } from "@/lib/event-json";

function fmtDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IE", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function EventCard({ e }: { e: EventPayload }) {
  return (
    <article className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {e.parentEventBrand ? (
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted-2)]">
              {e.parentEventBrand}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--fg)]">
            <Link href={`/events/${e.slug}`} className="hover:underline">
              {e.name}
            </Link>
          </h3>
        </div>
        <div className="text-right text-xs text-[var(--muted)]">
          <p>{fmtDate(e.startDate)} — {fmtDate(e.endDate)}</p>
          <p className="mt-1">
            {e.city}, {e.country}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        {e.summary ?? "Structured intelligence record — open for SAT-Core alignment and stakeholder routing."}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
        <div>
          <dt className="text-[var(--muted-2)]">Region</dt>
          <dd className="text-[var(--fg)]">{REGION_LABELS[e.geopoliticalRegion]}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Continent</dt>
          <dd className="text-[var(--fg)]">{CONTINENT_LABELS[e.continent]}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Keyra score</dt>
          <dd className="text-[var(--fg)]">{e.keyraPriorityScore}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Tier</dt>
          <dd className="text-[var(--fg)]">{TIER_LABELS[e.tier]}</dd>
        </div>
      </dl>
      {e.industries.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {e.industries.slice(0, 4).map((ind) => (
            <li
              key={ind.industry}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
            >
              {INDUSTRY_LABELS[ind.industry]}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
