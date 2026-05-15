"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KeyraHomeGlobe } from "@/components/home/KeyraHomeGlobe";
import {
  KeyraGlobeLiveActivityPanel,
  KeyraGlobeLiveStatPanel,
} from "@/components/home/KeyraGlobeLivePanels";
import { HomeRegistrationCTAs } from "@/components/registration/HomeRegistrationCTAs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";
import { HeroCosmicBackdrop } from "@/components/trust/HeroCosmicBackdrop";
import { NarrativeSection } from "@/components/home/narrative/NarrativeSection";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

function SignalDot({
  style,
  delay = "0s",
  size = 6,
}: {
  style: React.CSSProperties;
  delay?: string;
  size?: number;
}) {
  return (
    <span
      className="animate-keyra-signal absolute rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 30%, rgba(158,199,220,0.82), rgba(158,199,220,0.1) 55%, rgba(158,199,220,0) 70%)",
        boxShadow: "0 0 14px rgba(158,199,220,0.1), 0 0 36px rgba(120,140,175,0.06)",
        animationDelay: delay,
        ...style,
      }}
      aria-hidden
    />
  );
}

export function HomeContent() {
  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className="relative min-h-[min(92vh,58rem)] scroll-mt-44 overflow-hidden border-b border-keyra-border bg-keyra-bg px-[var(--keyra-space-section-x)] py-[var(--keyra-space-section-y)] lg:scroll-mt-24">
        <HeroCosmicBackdrop variant="marketing">
          <SignalDot style={{ left: "14%", top: "28%" }} delay="0.1s" />
          <SignalDot style={{ left: "26%", top: "42%" }} delay="1.1s" size={7} />
          <SignalDot style={{ left: "38%", top: "31%" }} delay="0.7s" />
          <SignalDot style={{ left: "49%", top: "52%" }} delay="1.8s" size={8} />
          <SignalDot style={{ left: "57%", top: "34%" }} delay="0.3s" />
          <SignalDot style={{ left: "66%", top: "46%" }} delay="1.4s" size={7} />
          <SignalDot style={{ left: "78%", top: "33%" }} delay="0.9s" />
          <SignalDot style={{ left: "84%", top: "55%" }} delay="2.1s" size={8} />
          <SignalDot style={{ left: "31%", top: "62%" }} delay="2.6s" />
          <SignalDot style={{ left: "62%", top: "68%" }} delay="1.9s" size={7} />
        </HeroCosmicBackdrop>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 py-6 sm:min-h-[54vh] lg:min-h-[56vh] lg:gap-12 lg:py-2">
          <header className="relative z-10 w-full min-w-0 lg:pt-2">
            <motion.p
              className="keyra-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: easeTrust }}
            >
              Sovereign trust infrastructure
            </motion.p>
            <div className="mt-5 max-w-[min(100%,52rem)]">
              <h1 className="keyra-display-hero text-balance">
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeTrust }}
                >
                  The Trust Layer of the Internet.
                </motion.span>
              </h1>
              <motion.p
                className="mt-7 max-w-xl text-pretty text-[17px] leading-[1.65] text-keyra-text-2 sm:text-[19px] sm:leading-[1.62]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: easeTrust }}
              >
                The internet finally became trustworthy — calm, deterministic identity for people,
                institutions, and verified intelligence.
              </motion.p>
            </div>

            <motion.div
              className="mt-10 w-full min-w-0 sm:mt-12"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: easeTrust }}
            >
              <PageIntentRibbon
                tone="onCosmic"
                who="Households, professionals, and institutions who live and work online."
                problem="Identity is fragmented; fraud and synthetic deception are routine."
                nextAction="Continue below, or sign in to manage your Keyra account."
              />
            </motion.div>
          </header>

          <div className="grid min-h-0 w-full grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)] lg:gap-12">
            <div className="relative z-10 w-full min-w-0 max-w-3xl">
              <motion.div
                className="w-full min-w-0"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: easeTrust }}
              >
                <HomeRegistrationCTAs />
              </motion.div>

              <motion.p
                className="mt-10 text-sm leading-relaxed text-keyra-text-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.26, ease: easeTrust }}
              >
                Post-password verification. Carrier-aware signals. Cryptographic orchestration — quiet,
                precise, inevitable.{" "}
                <span className="text-keyra-primary">Be Protected Online.</span>
              </motion.p>
            </div>

            <div className="pointer-events-auto relative z-0 flex w-full max-w-[min(100%,580px)] justify-center justify-self-center lg:max-w-[580px] lg:justify-self-end lg:pt-1">
              <div
                className="keyra-globe-stage relative box-border flex w-full flex-col gap-3 lg:block lg:min-h-[min(500px,62vw)] lg:px-3 lg:pb-7 lg:pt-5"
                suppressHydrationWarning
              >
                <KeyraGlobeLiveStatPanel />
                <div className="relative order-2 mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:absolute lg:left-1/2 lg:top-1/2 lg:max-w-[460px] lg:-translate-x-1/2 lg:-translate-y-1/2">
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-full opacity-90 blur-md sm:-inset-4"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 25%, rgba(158,199,220,0.11), transparent 58%), radial-gradient(circle at 70% 80%, rgba(110,130,168,0.07), transparent 55%)",
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative mx-auto aspect-square w-full overflow-hidden rounded-full shadow-[0_24px_80px_rgba(0,0,0,0.32)] lg:aspect-auto lg:h-[460px] lg:w-[min(100%-24px,460px)] lg:max-w-[460px]"
                    suppressHydrationWarning
                  >
                    <KeyraHomeGlobe className="block h-full w-full touch-pan-y" />
                  </div>
                </div>
                <KeyraGlobeLiveActivityPanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE COLLAPSE */}
      <NarrativeSection
        id="problem"
        eyebrow="The collapse"
        title="The internet lost identity."
        lead="We built connection without certainty. Fraud, impersonation, and synthetic voices spread where proof should live — and hesitation became normal."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 sm:gap-4">
          {[
            "Uncertainty replaced recognition.",
            "Trust became probabilistic.",
            "Humans and agents blurred.",
            "Institutions needed proof, not patches.",
          ].map((line) => (
            <Card key={line} className="border-keyra-border/80 bg-[rgba(255,255,255,0.02)] px-6 py-5 shadow-none backdrop-blur-[2px]">
              <p className="text-[15px] font-medium leading-snug tracking-tight text-keyra-primary sm:text-[16px]">
                {line}
              </p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 3 — THE SHIFT */}
      <NarrativeSection
        id="missing-layer"
        eyebrow="The shift"
        surface="elevated"
        title="AI changed the internet forever."
        lead="Generative scale collided with ambiguous identity. The next era requires orchestration between verified humans, verified systems, and verified carriers — not louder alerts."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            "Human + AI trust is now infrastructure.",
            "Proof must travel with the interaction.",
            "Calm defaults beat frantic friction.",
          ].map((line) => (
            <Card key={line} className="border-keyra-border/80 bg-[rgba(255,255,255,0.02)] px-6 py-5 shadow-none">
              <p className="text-[15px] font-medium leading-snug text-keyra-primary">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 4 — THE FRACTURE */}
      <NarrativeSection
        id="trust-fracture"
        eyebrow="The fracture"
        title="Passwords failed. Probabilistic trust failed."
        lead="Shared secrets, one-time codes, and guesswork cannot anchor sovereign-scale identity. What remained was exposure dressed as convenience."
      />

      {/* SECTION 5 — THE SOLUTION */}
      <NarrativeSection
        id="solution"
        eyebrow="The restoration"
        surface="elevated"
        title="Keyra restores deterministic trust."
        lead="A composed trust layer — SIM and eSIM-aware signals, cryptographic orchestration, and verification routing that feels inevitable because it is structured, not improvised."
      />

      {/* SECTION 6 — TRUST VISUALIZATION */}
      <NarrativeSection
        id="trust-signals"
        eyebrow="Trust visualization"
        title="Invisible systems, rendered with restraint."
        lead="Protection expressed as atmosphere — signal choreography instead of noise. Identity pulses quietly across carrier paths, hardware truth, and institutional policy."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {[
            "SIM / eSIM identity verification",
            "Secure carrier-scale authentication",
            "Cryptographic trust orchestration",
            "Identity signal intelligence",
            "Deterministic verification routing",
            "Institutional continuity — calm by default",
          ].map((line) => (
            <Card key={line} className="border-keyra-border/70 bg-transparent px-6 py-5 shadow-none">
              <p className="text-[14px] font-medium leading-relaxed text-keyra-text sm:text-[15px]">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 7 — GLOBAL */}
      <NarrativeSection
        id="global"
        eyebrow="Global infrastructure"
        surface="elevated"
        title="Carrier-scale architecture for national resilience."
        lead="Built in Ireland as a trust institution for the digital age — composed for global deployment without compromising sovereignty or clarity."
      >
        <Link href="/global-deployment" className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]">
          <Button variant="secondary">View global deployment</Button>
        </Link>
      </NarrativeSection>

      {/* SECTION 8 — WHO IT'S FOR */}
      <NarrativeSection
        id="for"
        eyebrow="Who it’s for"
        title="Everyone who depends on certainty."
        lead="One quiet standard across households, enterprises, and nations — verification that feels human because it is mathematically composed."
      >
        <div className="grid w-full gap-6 md:grid-cols-2">
          {[
            {
              title: "Individuals",
              headline: "Know who you are connecting with.",
              body: "Identity should protect you — everywhere you go online.",
              href: "/signup",
              cta: "Protect your identity",
            },
            {
              title: "Families",
              headline: "Protect those who don’t see every risk.",
              body: "Peace of mind for the people you care about most.",
              href: "/app/family",
              cta: "Protect your family",
            },
            {
              title: "Businesses",
              headline: "Build trust in every interaction.",
              body: "Reduce fraud. Elevate confidence. Protect your brand.",
              href: "/contact",
              cta: "Secure your organization",
            },
            {
              title: "Governments",
              headline: "Sovereign digital identity.",
              body: "Infrastructure for citizens, institutions, and national continuity.",
              href: "/contact",
              cta: "Partner with Keyra",
            },
          ].map((item) => (
            <div key={item.title} className="keyra-card border-keyra-border/80 p-7 sm:p-8">
              <p className="keyra-eyebrow text-[10px]">{item.title}</p>
              <h3 className="mt-4 text-balance text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">
                {item.headline}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">{item.body}</p>
              <Link href={item.href} className="mt-7 inline-flex">
                <Button variant="secondary">{item.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 9 — HUMAN + AI */}
      <NarrativeSection
        id="human-ai"
        eyebrow="Human + AI trust"
        surface="elevated"
        title="Verified agents. Verified humans. Verified interactions."
        lead="Orchestration that distinguishes authenticity from synthesis — without theatrical friction. Trust becomes ambient infrastructure."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-3">
          {[
            "Agents inherit institutional policy.",
            "Humans carry cryptographic continuity.",
            "Every surface inherits quiet assurance.",
          ].map((line) => (
            <Card key={line} className="border-keyra-border/80 bg-[rgba(255,255,255,0.02)] px-6 py-6 shadow-none">
              <p className="text-[15px] font-medium leading-snug text-keyra-primary">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 10 — DEVELOPER PLATFORM */}
      <NarrativeSection
        id="developers"
        eyebrow="Developer platform"
        title="API-first. Composed like infrastructure should be."
        lead="Documentation and primitives that treat trust as a craft — minimal surfaces, precise semantics, and clarity worthy of the institutions you serve."
      >
        <Link href="/developers" className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]">
          <Button variant="secondary">Explore the developer platform</Button>
        </Link>
      </NarrativeSection>

      {/* SECTION 11 — FINAL STATEMENT */}
      <section
        id="get-protected"
        className="keyra-section scroll-mt-44 pb-28 sm:scroll-mt-24 sm:pb-36"
        aria-labelledby="finale-heading"
      >
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border/90 bg-[linear-gradient(165deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-5 py-16 text-center sm:px-12 sm:py-24 md:py-28">
            <p className="keyra-eyebrow">Final statement</p>
            <h2 id="finale-heading" className="keyra-display-finale mx-auto mt-6 max-w-[18ch] text-balance">
              Be Protected Online.
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-[16px] leading-[1.65] text-keyra-text-2 sm:text-[17px]">
              Civilization-grade trust — rendered as calm infrastructure. Keyra is how the internet keeps its promises.
            </p>
            <div className="mx-auto mt-14 max-w-xl rounded-[var(--keyra-radius-card)] border border-keyra-border/80 bg-[rgba(255,255,255,0.03)] px-5 py-8 sm:px-8">
              <div className="mx-auto max-w-lg text-left">
                <HomeRegistrationCTAs />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
