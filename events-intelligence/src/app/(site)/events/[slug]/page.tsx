import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CONTINENT_LABELS,
  INDUSTRY_LABELS,
  REGION_LABELS,
  SAT_LABELS,
  TIER_LABELS,
} from "@/lib/constants";
import { getEventBySlug } from "@/lib/data/events";
import { EventDetailActions } from "@/components/events/EventDetailActions";

type Props = { params: Promise<{ slug: string }> };

function fmt(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function EventDetailPage(props: Props) {
  const { slug } = await props.params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted-2)]">
        {event.parentEventBrand ?? "Independent event"}
      </p>
      <h1 className="mt-3 text-4xl font-light leading-tight text-[var(--fg)]">{event.name}</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        {fmt(event.startDate)} — {fmt(event.endDate)}
        {event.venue ? ` · ${event.venue}` : ""}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {event.city}, {event.country} · {CONTINENT_LABELS[event.continent]} ·{" "}
        {REGION_LABELS[event.geopoliticalRegion]}
      </p>

      <dl className="mt-10 grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--elevated)] p-6 text-sm md:grid-cols-2">
        <div>
          <dt className="text-[var(--muted-2)]">Keyra priority score</dt>
          <dd className="mt-1 text-2xl font-light text-[var(--fg)]">{event.keyraPriorityScore}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Tier</dt>
          <dd className="mt-1 text-[var(--fg)]">{TIER_LABELS[event.tier]}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Estimated scale</dt>
          <dd className="mt-1 text-[var(--fg)]">
            {(event.estimatedAttendees ?? "—").toString()} attendees ·{" "}
            {(event.estimatedExhibitors ?? "—").toString()} exhibitors ·{" "}
            {(event.estimatedSpeakers ?? "—").toString()} speakers
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted-2)]">Years running</dt>
          <dd className="mt-1 text-[var(--fg)]">{event.yearsRunning ?? "—"}</dd>
        </div>
      </dl>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-[var(--fg)]">Event summary</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {event.summary ??
            "Summary not yet published — operators can add executive framing from the admin console."}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">Why this event matters to Keyra</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {event.whyItMatters ?? event.summary}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">Who attends</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{event.whoAttends}</p>
        <ul className="mt-4 grid gap-2 text-xs text-[var(--muted)] md:grid-cols-2">
          <li>Government: {event.governmentAttendance ? "High relevance" : "Limited"}</li>
          <li>Carriers: {event.carrierAttendance ? "High relevance" : "Limited"}</li>
          <li>Banking / fintech: {event.bankingFintechAttendance ? "High relevance" : "Limited"}</li>
          <li>Developers: {event.developerAttendance ? "High relevance" : "Limited"}</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">What Keyra solves there</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{event.problemKeyraSolves}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">SAT-Core service alignment</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{event.satCoreAlignment}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {event.satCoreProblems.map((s) => (
            <li
              key={s.problem}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--fg)]"
            >
              {SAT_LABELS[s.problem]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">Recommended Keyra action</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">{event.recommendedAction}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Meeting posture: <span className="text-[var(--fg)]">{event.targetMeetingType}</span>
        </p>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
          {event.targetMeetingList}
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-medium text-[var(--fg)]">Buyer & account lenses</h2>
        <dl className="mt-4 space-y-3 text-xs text-[var(--muted)]">
          <div>
            <dt className="text-[var(--muted-2)]">Personas</dt>
            <dd className="mt-1">
              {event.primaryBuyerPersona}
              {event.secondaryBuyerPersona ? ` · ${event.secondaryBuyerPersona}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-2)]">Target enterprises</dt>
            <dd className="mt-1">{event.targetCompanies.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-2)]">Carriers · banks · ministries</dt>
            <dd className="mt-1">
              {event.targetCarriers.join(", ") || "—"} · {event.targetBanks.join(", ") || "—"} ·{" "}
              {event.targetMinistries.join(", ") || "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-[var(--fg)]">Relevance radar</h2>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
          <li>Cybersecurity: {event.cybersecurityRelevance}</li>
          <li>Identity: {event.identityRelevance}</li>
          <li>Telecom: {event.telecomRelevance}</li>
          <li>AI: {event.aiRelevance}</li>
          <li>App security: {event.appSecurityRelevance}</li>
          <li>Government: {event.governmentRelevance}</li>
          <li>Banking: {event.bankingRelevance}</li>
        </ul>
      </section>

      {event.industries.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-[var(--fg)]">Industries</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {event.industries.map((i) => (
              <li key={i.industry} className="text-xs text-[var(--muted)]">
                {INDUSTRY_LABELS[i.industry]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        {event.eventWebsite ? (
          <a
            href={event.eventWebsite}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Official website
          </a>
        ) : null}
        {event.sourceUrl ? (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Source reference
          </a>
        ) : null}
      </div>

      <EventDetailActions eventSlug={event.slug} eventId={event.id} />

      <p className="mt-16 text-xs text-[var(--muted-2)]">
        Verification: {event.verificationStatus} · Owner: {event.keyraOwner ?? "—"} · Last updated{" "}
        {(event.lastUpdated instanceof Date ? event.lastUpdated : new Date(event.lastUpdated))
          .toISOString()
          .slice(0, 10)}
      </p>

      <p className="mt-6 text-sm">
        <Link href="/events" className="underline-offset-4 hover:underline">
          ← Catalogue
        </Link>
      </p>
    </article>
  );
}
