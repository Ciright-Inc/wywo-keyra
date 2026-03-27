import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Trust",
  description:
    "How KEYRA thinks about trust: user-first protection, privacy respect, and clarity in every interaction.",
};

const pillars = [
  {
    title: "Trust-centred design",
    body: "Every screen and message is meant to reduce doubt. You should always understand what is happening and why it helps you.",
    tag: "Design",
  },
  {
    title: "User-first protection",
    body: "Security exists to serve people — not the other way around. KEYRA prioritizes your control, dignity, and everyday ease.",
    tag: "People",
  },
  {
    title: "Privacy respect",
    body: "Your data deserves care. KEYRA is shaped around privacy-aware practices and honest communication about how identity is used.",
    tag: "Privacy",
  },
  {
    title: "Clarity and transparency",
    body: "We avoid hidden complexity. When choices matter, we explain them in plain language you can act on with confidence.",
    tag: "Clarity",
  },
  {
    title: "Confidence in every interaction",
    body: "From enrolment to verification to account management, each step should feel calm, intentional, and worthy of your trust.",
    tag: "Experience",
  },
];

export default function TrustPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative bg-keyra-bg">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,64rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-keyra-border to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <p className="text-sm font-medium uppercase tracking-widest text-keyra-accent">
                Trust
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-keyra-ink sm:text-5xl">
                Trust at KEYRA
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-keyra-muted">
                Trust is not a slogan. It is a set of choices — about design,
                language, privacy, and respect for the person using the service.
              </p>
            </FadeIn>
          </div>

          <FadeIn className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { label: "Safe", blurb: "Protection without fear." },
              { label: "Simple", blurb: "No maze of jargon." },
              { label: "Human", blurb: "Built around you." },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-keyra-border bg-keyra-surface px-5 py-4 text-center"
              >
                <p className="text-lg font-semibold text-keyra-ink">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-keyra-muted">{item.blurb}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-keyra-border bg-keyra-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <FadeIn>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-keyra-ink sm:text-3xl">
                  What we hold ourselves to
                </h2>
                <p className="mt-2 max-w-xl text-keyra-muted">
                  Five principles guide how KEYRA shows up — in product, in
                  words, and in how we treat your identity.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 rounded-full border border-keyra-border bg-keyra-bg px-5 py-2.5 text-sm font-semibold text-keyra-ink transition hover:border-keyra-accent/35"
              >
                Questions? Contact us
              </Link>
            </div>
          </FadeIn>

          <div className="mt-12 space-y-4">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.04}>
                <div className="group relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-bg/40 p-1 transition hover:bg-keyra-surface">
                  <div className="flex flex-col gap-5 rounded-[1.35rem] bg-keyra-surface p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
                    <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-keyra-accent text-lg font-bold text-keyra-surface">
                        {i + 1}
                      </span>
                      <span className="rounded-full bg-keyra-accent-soft px-3 py-1 text-xs font-semibold text-keyra-accent sm:text-center">
                        {p.tag}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 border-t border-keyra-border pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                      <h3 className="text-xl font-semibold text-keyra-ink">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-keyra-muted sm:text-base">
                        {p.body}
                      </p>
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-0 bg-keyra-accent transition-all duration-300 group-hover:w-full"
                    aria-hidden
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-keyra-border bg-keyra-accent-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-keyra-border/80 bg-keyra-surface px-8 py-10 sm:flex-row sm:items-center sm:px-10">
              <div>
                <p className="text-lg font-semibold text-keyra-ink">
                  Trust is built in, not bolted on
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-keyra-muted">
                  The same care you see here carries through enrolment,
                  verification, and how we talk about your data.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex rounded-full bg-keyra-accent px-6 py-3 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-muted"
              >
                Read about KEYRA
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
