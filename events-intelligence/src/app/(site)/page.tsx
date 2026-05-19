import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { RegionLattice } from "@/components/map/RegionLattice";
import { getFeaturedEvents } from "@/lib/data/events";
import {
  INDUSTRY_LABELS,
  INDUSTRY_ORDER,
  REGION_LABELS,
  REGION_ORDER,
  REGION_SLUGS,
  SAT_LABELS,
} from "@/lib/constants";
import type { SatCoreProblem } from "@prisma/client";

export default async function HomePage() {
  const featured = await getFeaturedEvents(8);
  const allSatKeys = Object.keys(SAT_LABELS) as SatCoreProblem[];

  return (
    <div className="space-y-24 pb-24">
      <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-20">
        <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted-2)]">Calm surface · deep intelligence</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-tight text-[var(--fg)] md:text-5xl">
          Keyra Global Events Intelligence
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
          Mapping the world&apos;s digital trust, cybersecurity, telecom, identity, AI, fintech, and app
          infrastructure events — organized first by geopolitical region, then continent, country, and
          industry.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Keyra tracks where governments, carriers, banks, platforms, developers, and cybersecurity leaders
          gather to solve trust, authentication, identity, fraud, and secure access problems — the global
          field layer for SAT-Core.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/events"
            className="rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[var(--bg)] transition hover:opacity-90"
          >
            Browse events
          </Link>
          <Link
            href="/map"
            className="rounded-full border border-[var(--line)] bg-transparent px-6 py-2.5 text-sm text-[var(--fg)] transition hover:bg-[var(--elevated)]"
          >
            Open global map
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-2xl font-light text-[var(--fg)]">Why this event matters to Keyra</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Every catalogue row answers where strategic gravity sits for SAT-Core: who needs subscriber-bound
          assurance, who is exposed to SIM-subscriber fraud, where IAM complexity breaks in banking and
          government, and which carriers monetize trust next. Detail pages spell out narrative summary,
          attendee physics, SAT-Core mapping, recommended posture (sponsor / speak / carrier workshop /
          private dinner), and target ministries, carriers, banks, and enterprises.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/priority" className="underline-offset-4 hover:underline">
            Open Tier-1 priority roster →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-light text-[var(--fg)]">Interactive region lattice</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
              Navigate by geopolitical region — the primary lens for how Keyra deploys field intelligence.
            </p>
          </div>
          <Link href="/regions" className="text-sm text-[var(--fg)] underline-offset-4 hover:underline">
            Full region directory
          </Link>
        </div>
        <RegionLattice />
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-light text-[var(--fg)]">Featured Tier 1 anchors</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
              A curated slice of strategic gravity — not the entire catalogue.
            </p>
          </div>
          <Link href="/priority" className="text-sm text-[var(--fg)] underline-offset-4 hover:underline">
            View priority roster
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-2xl font-light text-[var(--fg)]">Filter by SAT-Core problem space</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Trace where SAT-Core proof points resonate — account takeover, SIM swap, zero trust, AI-agent
          identity, roaming trust, developer burden, and more.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {allSatKeys.map((p) => (
            <li key={p}>
              <Link
                href={`/events?sat=${p}`}
                className="inline-flex rounded-full border border-[var(--line)] bg-[var(--elevated)] px-3 py-1.5 text-xs text-[var(--fg)] transition hover:border-[var(--fg)]"
              >
                {SAT_LABELS[p]}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/sat-core" className="underline-offset-4 hover:underline">
            SAT-Core alignment overview →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-2xl font-light text-[var(--fg)]">Filter by geopolitical region</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Jump straight into the catalogue scoped to a theater — same ordering model operators use in the
          field console.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REGION_ORDER.map((r) => (
            <Link
              key={r}
              href={`/events?region=${REGION_SLUGS[r]}`}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--elevated)] hover:border-[var(--fg)]"
            >
              {REGION_LABELS[r]}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-2xl font-light text-[var(--fg)]">Filter by industry lane</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Cross-cut cybersecurity, identity, telecom, banking, digital government, AI, IoT, payments, and
          adjacent stacks.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {INDUSTRY_ORDER.map((ind) => (
            <Link
              key={ind}
              href={`/events?industry=${ind}`}
              className="rounded-full border border-[var(--line)] bg-[var(--elevated)] px-3 py-1.5 text-xs text-[var(--fg)] transition hover:border-[var(--fg)]"
            >
              {INDUSTRY_LABELS[ind]}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link href="/industries" className="underline-offset-4 hover:underline">
            Industry directory →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl rounded-3xl border border-[var(--line)] bg-[var(--elevated)] px-6 py-12 md:px-12">
        <h2 className="text-2xl font-light text-[var(--fg)]">Why this surface stays calm</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Keyra&apos;s public map stays quiet while the dataset underneath scales — relevance scoring,
          stakeholder graphs, verification workflows, and SAT-Core tagging remain accessible to authenticated
          operators via the admin console.
        </p>
        <Link
          href="/request-meeting"
          className="mt-8 inline-flex rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[var(--bg)]"
        >
          Request a Keyra meeting
        </Link>
      </section>
    </div>
  );
}
