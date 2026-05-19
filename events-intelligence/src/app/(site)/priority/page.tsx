import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { getPriorityEvents } from "@/lib/data/events";

export default async function PriorityPage() {
  const events = await getPriorityEvents(48);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted-2)]">Tier 1 roster</p>
      <h1 className="mt-3 text-4xl font-light text-[var(--fg)]">Priority events</h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        Strategic anchors sorted by Keyra priority scoring — authentication identity weighting, telecom and
        banking relevance, government posture, application security depth, scale, and maturity.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {events.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>
      <p className="mt-12 text-sm">
        <Link href="/events" className="underline-offset-4 hover:underline">
          Full catalogue →
        </Link>
      </p>
    </div>
  );
}
