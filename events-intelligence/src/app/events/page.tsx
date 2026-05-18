import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { REGION_LABELS, REGION_ORDER, REGION_SLUGS, SAT_LABELS, SLUG_TO_REGION } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  buildEventOrderBy,
  buildEventWhere,
  type EventListSort,
  parseIndustryList,
  parseSatList,
} from "@/lib/event-query";
import type { SatCoreProblem } from "@prisma/client";

type Search = Record<string, string | string[] | undefined>;

function single(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function EventsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = single(sp.q);
  const regionSlug = single(sp.region);
  const sort = (single(sp.sort) ?? "startDate") as EventListSort;
  const satRaw = single(sp.sat);
  const indRaw = single(sp.industries);

  const regionEnum = regionSlug ? SLUG_TO_REGION[regionSlug] : undefined;

  const industries = parseIndustryList(indRaw ?? null);
  const satProblems = parseSatList(satRaw ?? null);

  const where = buildEventWhere({
    q: q ?? null,
    region: regionEnum ?? undefined,
    industries,
    satProblems,
    approvedFilter: "public",
  });

  const orderBy = buildEventOrderBy(sort);

  const events = await prisma.event.findMany({
    where,
    orderBy,
    take: 80,
    include: { industries: true, satCoreProblems: true },
  });

  const satKeys = Object.keys(SAT_LABELS) as SatCoreProblem[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">Events catalogue</h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        Sort by priority score, attendance gravity, identity relevance, telecom relevance, SAT-Core fit,
        or calendar date — filters compose without overwhelming the surface.
      </p>

      <form
        method="get"
        className="mt-10 grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--elevated)] p-6 md:grid-cols-4"
      >
        <label className="md:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted-2)]">Search</span>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Event name"
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted-2)]">Region</span>
          <select
            name="region"
            defaultValue={regionSlug ?? ""}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="">All regions</option>
            {REGION_ORDER.map((r) => (
              <option key={r} value={REGION_SLUGS[r]}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted-2)]">Sort</span>
          <select
            name="sort"
            defaultValue={sort}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            <option value="startDate">Date</option>
            <option value="priorityScore">Keyra priority score</option>
            <option value="attendees">Attendees</option>
            <option value="yearsRunning">Years running</option>
            <option value="identity">Identity relevance</option>
            <option value="telecom">Telecom relevance</option>
            <option value="banking">Banking relevance</option>
            <option value="government">Government relevance</option>
            <option value="cybersecurity">Cybersecurity relevance</option>
            <option value="appSecurity">App security relevance</option>
            <option value="country">Country</option>
            <option value="city">City</option>
            <option value="region">Region</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted-2)]">
            SAT-Core problems (comma-separated enum keys)
          </span>
          <input
            name="sat"
            defaultValue={satRaw ?? ""}
            placeholder="e.g. SIM_SWAP,ACCOUNT_TAKEOVER"
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-mono text-xs"
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted-2)]">
            Industries (comma-separated enum keys)
          </span>
          <input
            name="industries"
            defaultValue={indRaw ?? ""}
            placeholder="e.g. FINTECH,TELECOM"
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-mono text-xs"
          />
        </label>
        <div className="flex items-end md:col-span-4">
          <button
            type="submit"
            className="rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[var(--bg)]"
          >
            Apply filters
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap gap-2 text-xs">
        <span className="text-[var(--muted-2)]">Quick SAT filters:</span>
        {satKeys.slice(0, 10).map((k) => (
          <Link
            key={k}
            href={`/events?sat=${k}`}
            className="rounded-full border border-[var(--line)] px-2 py-1 text-[var(--fg)] hover:bg-[var(--surface)]"
          >
            {SAT_LABELS[k]}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {events.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No matching public events.</p>
      ) : null}

      <p className="mt-10 text-xs text-[var(--muted-2)]">
        Filters accept Prisma enum keys (uppercase). Example SAT-Core tags:{" "}
        <code className="font-mono">SIM_SWAP</code>, <code className="font-mono">ZERO_TRUST</code>.
        Industries: <code className="font-mono">FINTECH</code>,{" "}
        <code className="font-mono">TELECOM</code>.
      </p>
    </div>
  );
}
