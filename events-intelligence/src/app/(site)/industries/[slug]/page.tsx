import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { INDUSTRY_LABELS, SLUG_TO_INDUSTRY } from "@/lib/constants";
import { getEventsByIndustry } from "@/lib/data/events";

type Props = { params: Promise<{ slug: string }> };

export default async function IndustryPage(props: Props) {
  const { slug } = await props.params;
  const industry = SLUG_TO_INDUSTRY[slug];
  if (!industry) notFound();

  const events = await getEventsByIndustry(industry);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-2)]">Industry lane</p>
      <h1 className="mt-3 text-4xl font-light text-[var(--fg)]">{INDUSTRY_LABELS[industry]}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {events.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>
      <p className="mt-12 text-sm">
        <Link href="/industries" className="underline-offset-4 hover:underline">
          ← Industries
        </Link>
      </p>
    </div>
  );
}
