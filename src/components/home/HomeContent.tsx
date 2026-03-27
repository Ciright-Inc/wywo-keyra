"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { HeroVisual } from "./HeroVisual";

function SectionShell({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function CtaButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-keyra-accent";
  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={`${base} bg-keyra-accent text-keyra-surface hover:bg-keyra-muted`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} border border-keyra-border/25 bg-keyra-surface text-keyra-ink hover:border-keyra-accent/35`}
    >
      {children}
    </Link>
  );
}

export function HomeContent() {
  return (
    <>
      <SectionShell className="pt-10 sm:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.p
              className="text-sm font-medium uppercase tracking-widest text-keyra-accent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              KEYRA.ie
            </motion.p>
            <motion.h1
              className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-keyra-ink sm:text-5xl lg:text-[3.25rem]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              The trust layer of the internet
            </motion.h1>
            <motion.p
              className="mt-5 max-w-xl text-lg leading-relaxed text-keyra-muted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              KEYRA helps protect you, your identity, and your digital life by
              making sure it is really you online. Safe, simple, secure.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <CtaButton href="/#get-started">Get protected</CtaButton>
              <CtaButton href="/how-it-works" variant="secondary">
                How KEYRA works
              </CtaButton>
            </motion.div>
          </div>
          <HeroVisual />
        </div>
      </SectionShell>

      <SectionShell className="bg-keyra-surface">
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            Security, built around you
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-keyra-muted">
            KEYRA is designed for real people living real digital lives. From
            logging in and managing accounts to protecting family access and
            personal identity, KEYRA helps make the internet safer and simpler.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Protects your identity",
              "Helps prevent unauthorized access",
              "Supports safer sign-in and account trust",
              "Gives you more control over your digital presence",
            ].map((text) => (
              <li
                key={text}
                className="flex gap-3 rounded-2xl border border-keyra-border/25 bg-keyra-bg px-5 py-4 text-keyra-ink"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-keyra-accent"
                  aria-hidden
                />
                <span className="text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </SectionShell>

      <SectionShell>
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            The internet should know it’s really you
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-keyra-muted">
            Too much of today’s internet depends on passwords, guesswork, and
            weak signals of trust. That leaves people exposed to fraud,
            impersonation, and account misuse. KEYRA adds a stronger layer of
            trust so your identity can be recognized and protected with more
            confidence.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Protect your identity",
                body: "Help reduce impersonation and account misuse.",
              },
              {
                title: "Verify real access",
                body: "Support trusted authentication when it matters most.",
              },
              {
                title: "Feel more in control",
                body: "Manage your digital identity with greater confidence.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-2xl border border-keyra-border/25 bg-keyra-surface p-6"
              >
                <h3 className="text-lg font-semibold text-keyra-ink">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
                  {c.body}
                </p>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell className="bg-keyra-accent-soft/40">
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            Simple protection in three steps
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-keyra-muted">
            KEYRA is built to make identity protection feel straightforward. No
            complexity. No heavy learning curve. Just a smarter way to help
            protect the person behind the screen.
          </p>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "Enrol",
                text: "Create your trusted identity with KEYRA.",
              },
              {
                step: "Verify",
                text: "Confirm it’s really you when you access important digital services.",
              },
              {
                step: "Manage",
                text: "Stay in control of your identity, access, and account trust over time.",
              },
            ].map((s, i) => (
              <li
                key={s.step}
                className="relative rounded-2xl border border-keyra-border/25 bg-keyra-surface p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-keyra-accent text-sm font-bold text-keyra-surface">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-keyra-ink">
                  {s.step}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </FadeIn>
      </SectionShell>

      <SectionShell>
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            Why people will trust KEYRA
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Made for everyday life",
                body: "Built for normal people, not only technical experts.",
              },
              {
                title: "Designed for peace of mind",
                body: "A calmer, clearer approach to online protection.",
              },
              {
                title: "Helps protect what matters",
                body: "Your identity, your accounts, your access, your family.",
              },
              {
                title: "Simple to use",
                body: "Clear enrolment, clear verification, clear control.",
              },
              {
                title: "Always centered on trust",
                body: "The digital world works better when trust is built in.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-keyra-border/20 bg-keyra-surface px-5 py-5"
              >
                <h3 className="font-semibold text-keyra-ink">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell className="bg-keyra-surface">
        <FadeIn>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
                Protection for you and the people you care about
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-keyra-muted">
                KEYRA is not just about one login or one moment. It is about
                helping protect the people in your life across the digital
                experiences that matter most. A safer internet starts with
                trusted identity.
              </p>
              <div className="mt-8">
                <CtaButton href="/#get-started">Protect your family</CtaButton>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-keyra-border/25 bg-keyra-bg p-10">
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "You",
                  "Household",
                  "People you trust",
                ].map((label, i) => (
                  <motion.div
                    key={label}
                    className="flex h-20 w-28 flex-col items-center justify-center rounded-2xl bg-keyra-surface"
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-keyra-accent-soft text-xs font-semibold text-keyra-accent">
                      {label.slice(0, 1)}
                    </span>
                    <span className="mt-2 text-center text-xs font-medium text-keyra-muted">
                      {label}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-keyra-muted">
                Household-ready protection — evolving with family needs and app
                downloads over time.
              </p>
            </div>
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell>
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            Safe. Simple. Secure.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-keyra-muted">
            KEYRA is built to help people feel more confident online. Every
            part of the experience should feel clear, respectful, and easy to
            understand. Trust is not something people should have to guess. It
            should be built in.
          </p>
          <ul className="mt-10 flex flex-wrap gap-2">
            {[
              "Clear identity enrolment",
              "Secure authentication experience",
              "User-first design",
              "Privacy-respecting approach",
              "Simple account management",
            ].map((t) => (
              <li
                key={t}
                className="rounded-full border border-keyra-border/25 bg-keyra-surface px-4 py-2 text-sm text-keyra-ink"
              >
                {t}
              </li>
            ))}
          </ul>
        </FadeIn>
      </SectionShell>

      <SectionShell className="border-y border-keyra-border/20 bg-keyra-surface">
        <FadeIn>
          <h2 className="text-3xl font-semibold tracking-tight text-keyra-ink sm:text-4xl">
            A better internet begins with trusted identity
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-keyra-muted">
            KEYRA is building a future where people can move through the
            internet with more confidence, less friction, and stronger
            protection. The goal is simple: a digital world where trust starts
            with the individual.
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell id="get-started" className="pb-24">
        <FadeIn>
          <div
            id="waitlist"
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-keyra-border/20 bg-keyra-accent px-6 py-14 text-center text-keyra-surface sm:px-12"
          >
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Join the future of trusted identity
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-keyra-surface/80">
              Be among the first to experience a simpler, safer way to protect
              your digital life with KEYRA.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-keyra-surface px-6 py-3 text-sm font-semibold text-keyra-ink transition hover:bg-keyra-bg"
              >
                Get started
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full border border-keyra-surface/30 px-6 py-3 text-sm font-semibold text-keyra-surface transition hover:bg-keyra-surface/10"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </FadeIn>
      </SectionShell>
    </>
  );
}
