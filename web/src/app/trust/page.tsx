import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Trust",
  description:
    "Be Protected Online — how KEYRA earns trust through calm design, protection first, and respect for you.",
};

const pillars = [
  {
    title: "Human-centred design",
    body: "Every screen and message should feel clear. You always understand what is happening — and how it helps keep you protected.",
    tag: "Design",
  },
  {
    title: "Protection first",
    body: "Protection exists to serve people — not the other way around. KEYRA keeps your control, dignity, and everyday ease at the centre.",
    tag: "People",
  },
  {
    title: "Privacy respect",
    body: "Your data deserves care. We are shaped around privacy-aware practices and honest words about how your identity is used.",
    tag: "Privacy",
  },
  {
    title: "Clarity and transparency",
    body: "We avoid hidden complexity. When a choice matters, we explain it in plain language you can act on with quiet confidence.",
    tag: "Clarity",
  },
  {
    title: "Confidence at every step",
    body: "From the moment you join through verification and day-to-day use, each step should feel calm, intentional, and worthy of your trust.",
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
              <p className="text-[14px] font-semibold uppercase tracking-widest text-keyra-accent">
                Trust
              </p>
              <p className="mt-4 text-balance text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl md:text-[28px]">
                Be Protected Online
              </p>
              <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
                Why KEYRA feels calm
              </h1>
              <p className="mt-6 text-[16px] leading-relaxed text-keyra-muted sm:text-[18px]">
                Trust is not a slogan. It is a set of choices — about design,
                language, privacy, and respect for the person using the service.
                Is your identity protected? We aim to answer that with clarity,
                every time.
              </p>
            </FadeIn>
          </div>

          <FadeIn className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { label: "Calm", blurb: "Protection without fear." },
              { label: "Simple", blurb: "No maze of jargon." },
              { label: "Human", blurb: "Built around you." },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-keyra-border/20 bg-keyra-surface px-5 py-4 text-center"
              >
                <p className="text-lg font-semibold text-keyra-primary">
                  {item.label}
                </p>
                <p className="mt-1 text-[14px] text-keyra-muted">{item.blurb}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-keyra-border/20 bg-keyra-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <FadeIn>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-keyra-primary sm:text-3xl md:text-[2.25rem]">
                  What we hold ourselves to
                </h2>
                <p className="mt-2 max-w-xl text-[16px] text-keyra-muted">
                  Five principles guide how KEYRA shows up — in product, in
                  words, and in how we treat your identity.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 rounded-full border border-keyra-border/20 bg-keyra-bg px-5 py-2.5 text-[14px] font-semibold text-keyra-primary transition hover:border-keyra-accent/35"
              >
                Questions? Contact us
              </Link>
            </div>
          </FadeIn>

          <div className="mt-12 space-y-4">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.04}>
                <div className="group relative overflow-hidden rounded-[16px] border border-keyra-border/20 bg-keyra-bg p-1 transition hover:bg-keyra-surface">
                  <div className="flex flex-col gap-5 rounded-[14px] bg-keyra-surface p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
                    <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-keyra-primary bg-keyra-surface text-lg font-bold text-keyra-primary">
                        {i + 1}
                      </span>
                      <span className="rounded-full border border-keyra-border bg-keyra-bg px-3 py-1 text-xs font-semibold text-keyra-accent sm:text-center">
                        {p.tag}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 border-t border-keyra-border/20 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                      <h3 className="text-xl font-semibold text-keyra-primary">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-keyra-muted sm:text-base">
                        {p.body}
                      </p>
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-0 bg-keyra-primary transition-all duration-300 group-hover:w-full"
                    aria-hidden
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-keyra-border/20 bg-keyra-bg">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <FadeIn>
            <div className="flex flex-col items-start justify-between gap-8 rounded-[16px] border border-keyra-border/20 bg-keyra-surface px-8 py-10 sm:flex-row sm:items-center sm:px-10">
              <div>
                <p className="text-lg font-semibold text-keyra-primary">
                  Protection is built in, not bolted on
                </p>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-keyra-muted sm:text-[16px]">
                  The same care you see here carries through when you join,
                  verify once, and use KEYRA day to day — always with protection
                  first.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex rounded-full bg-keyra-accent px-6 py-3 text-[16px] font-semibold text-keyra-surface transition hover:opacity-95"
              >
                About KEYRA
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
