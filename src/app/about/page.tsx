import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "About KEYRA",
  description:
    "KEYRA exists to help make the internet safer, simpler, and more trusted for people everywhere.",
};

const sections = [
  {
    kicker: "Our mission",
    title: "You at the centre",
    body: "We believe everyday people deserve a calm, clear way to be recognized online. KEYRA puts you at the centre: your identity, your control, your peace of mind.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 20a7 7 0 1 1 14 0H18a6 6 0 0 0-12 0H5Z"
          fill="currentColor"
          className="text-keyra-accent"
        />
      </svg>
    ),
  },
  {
    kicker: "Why trust matters",
    title: "Less guesswork online",
    body: "When services are unsure who is on the other side, friction and risk grow. Stronger trust helps reduce impersonation, confusion, and account stress — without turning security into a maze.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M12 2 4 6v5c0 5 3 8 8 8s8-3 8-8V6l-8-4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          className="text-keyra-accent"
        />
      </svg>
    ),
  },
  {
    kicker: "Built for people",
    title: "Plain language, real life",
    body: "KEYRA speaks plain language, respects privacy, and designs for household life — not only for experts or enterprises. The human behind the device always comes first.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4 11h4v9H4v-9Zm6-6h4v15h-4V5Zm6 3h4v12h-4V8Z"
          fill="currentColor"
          className="text-keyra-accent"
        />
      </svg>
    ),
  },
  {
    kicker: "A safer digital future",
    title: "Confidence for families",
    body: "We are building toward a web where identity is verified with confidence, services feel reliable, and families can move through digital life with less worry.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M12 21s-6-4.5-6-9a6 6 0 1 1 12 0c0 4.5-6 9-6 9Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          className="text-keyra-accent"
        />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-keyra-border bg-keyra-surface">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-end lg:gap-16">
            <FadeIn>
              <p className="text-sm font-medium uppercase tracking-widest text-keyra-accent">
                About KEYRA
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-keyra-ink sm:text-5xl lg:text-[2.75rem] lg:leading-tight">
                Safer, simpler, more human online
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-keyra-muted">
                KEYRA exists to help make the internet safer, simpler, and more
                trusted for people everywhere.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/how-it-works"
                  className="inline-flex rounded-full border border-keyra-border bg-keyra-bg px-5 py-2.5 text-sm font-semibold text-keyra-ink transition hover:border-keyra-accent/35"
                >
                  How it works
                </Link>
                <Link
                  href="/#get-started"
                  className="inline-flex rounded-full bg-keyra-accent px-5 py-2.5 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-muted"
                >
                  Get protected
                </Link>
              </div>
            </FadeIn>
            <FadeIn className="relative rounded-3xl border border-keyra-border bg-keyra-bg p-8 lg:mb-1">
              <div className="relative space-y-4 text-sm leading-relaxed text-keyra-muted">
                <p className="font-medium text-keyra-ink">What we believe</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-keyra-accent" />
                    Trust should feel calm — never loud or frightening.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-keyra-accent" />
                    Identity protection is for households, not only for experts.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-keyra-accent" />
                    Clarity and respect build confidence over time.
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <FadeIn>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-keyra-ink sm:text-3xl">
            Our story, in four beats
          </h2>
          <p className="mt-3 max-w-2xl text-keyra-muted">
            Each part of KEYRA comes back to one idea: the person behind the
            screen deserves to be seen, protected, and in control.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {sections.map((s, i) => (
            <FadeIn key={s.kicker} delay={i * 0.05}>
              <article className="group relative flex h-full flex-col rounded-3xl border border-keyra-border bg-keyra-surface p-6 transition hover:border-keyra-accent/25 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-keyra-accent-soft text-keyra-accent transition group-hover:scale-[1.02]">
                    {s.icon}
                  </div>
                  <span className="rounded-full bg-keyra-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-keyra-muted">
                    {s.kicker}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-keyra-ink">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-keyra-muted">
                  {s.body}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-16 rounded-3xl border border-keyra-border bg-keyra-accent px-8 py-10 text-center text-keyra-surface sm:px-12">
          <p className="text-lg font-medium text-keyra-surface/95">
            KEYRA — the trust layer of the internet
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-keyra-surface/75">
            Ready to see how enrolment, verification, and control fit together?
          </p>
          <Link
            href="/how-it-works"
            className="mt-6 inline-flex rounded-full bg-keyra-surface px-6 py-3 text-sm font-semibold text-keyra-ink transition hover:bg-keyra-bg"
          >
            Explore how KEYRA works
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
