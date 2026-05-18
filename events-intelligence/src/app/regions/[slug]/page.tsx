import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { REGION_LABELS, SLUG_TO_REGION } from "@/lib/constants";
import { getEventsByRegion } from "@/lib/data/events";

type Props = { params: Promise<{ slug: string }> };

export default async function RegionPage(props: Props) {
  const { slug } = await props.params;
  const region = SLUG_TO_REGION[slug];
  if (!region) notFound();

  const events = await getEventsByRegion(region);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-2)]">Geopolitical region</p>
      <h1 className="mt-3 text-4xl font-light text-[var(--fg)]">{REGION_LABELS[region]}</h1>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Events are indexed here before country drill-down — matching how Keyra sequences sovereign carriers,
        central banks, and national digital infrastructure buyers.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {events.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No public catalogue rows yet — operators can publish approved intelligence from the admin
            console.
          </p>
        ) : (
          events.map((e) => <EventCard key={e.id} e={e} />)
        )}
      </div>
      <p className="mt-12 text-sm">
        <Link href="/regions" className="underline-offset-4 hover:underline">
          ← All regions
        </Link>
      </p>
    </div>
  );
}
