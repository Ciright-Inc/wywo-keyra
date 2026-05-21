"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroBento } from "@/components/home/HeroBento";
import { useClientReady } from "@/lib/useClientReady";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NarrativeSection } from "@/components/home/narrative/NarrativeSection";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

const homeCard = "keyra-home-card px-6 py-5";
const homeCardOnDark = "keyra-home-card keyra-surface-light px-6 py-5";
const homeAudienceCard = "keyra-card keyra-home-card p-7 sm:p-8";
const homeHeroPanel = "keyra-home-panel";

export function HomeContent() {
  const clientReady = useClientReady();

  return (
    <>
      {/* SECTION 1 — HERO (premium bento grid) */}
      <HeroBento clientReady={clientReady} />

      {/* SECTION 2 — THE COLLAPSE */}
      <NarrativeSection
        id="problem"
        band="dark"
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
            <Card key={line} className={homeCardOnDark}>
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
        band="light"
        eyebrow="The shift"
        title="AI changed the internet forever."
        lead="Generative scale collided with ambiguous identity. The next era requires orchestration between verified humans, verified systems, and verified carriers — not louder alerts."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          {[
            "Human + AI trust is now infrastructure.",
            "Proof must travel with the interaction.",
            "Calm defaults beat frantic friction.",
          ].map((line) => (
            <Card key={line} className={homeCard}>
              <p className="text-[15px] font-medium leading-snug text-keyra-primary">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 4 — THE FRACTURE */}
      <NarrativeSection
        id="trust-fracture"
        band="dark"
        eyebrow="The fracture"
        title="Passwords failed. Probabilistic trust failed."
        lead="Shared secrets, one-time codes, and guesswork cannot anchor sovereign-scale identity. What remained was exposure dressed as convenience."
      />

      {/* SECTION 5 — THE SOLUTION */}
      <NarrativeSection
        id="solution"
        band="light"
        eyebrow="The restoration"
        title="Keyra restores deterministic trust."
        lead="A composed trust layer — SIM and eSIM-aware signals, cryptographic orchestration, and verification routing that feels inevitable because it is structured, not improvised."
      />

      {/* SECTION 6 — TRUST VISUALIZATION */}
      <NarrativeSection
        id="trust-signals"
        band="dark"
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
            <Card key={line} className={homeCardOnDark}>
              <p className="text-[14px] font-medium leading-relaxed text-keyra-primary sm:text-[15px]">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 7 — GLOBAL */}
      <NarrativeSection
        id="global"
        band="light"
        eyebrow="Global infrastructure"
        title="Carrier-scale architecture for national resilience."
        lead="Built in Ireland as a trust institution for the digital age — composed for global deployment without compromising sovereignty or clarity."
      >
        <div className={`${homeHeroPanel} inline-flex w-fit px-4 py-4`}>
          <Link
            href="/global-deployment"
            prefetch={false}
            className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]"
          >
            <Button variant="secondary">View global deployment</Button>
          </Link>
        </div>
      </NarrativeSection>

      {/* SECTION 8 — WHO IT'S FOR */}
      <NarrativeSection
        id="for"
        band="dark"
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
            <div key={item.title} className={homeAudienceCard}>
              <p className="keyra-eyebrow text-[10px]">{item.title}</p>
              <h3 className="mt-4 text-balance text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">
                {item.headline}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">{item.body}</p>
              <Link href={item.href} prefetch={false} className="mt-7 inline-flex">
                <Button variant="secondary">{item.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 9 — HUMAN + AI */}
      <NarrativeSection
        id="human-ai"
        band="light"
        eyebrow="Human + AI trust"
        title="Verified agents. Verified humans. Verified interactions."
        lead="Orchestration that distinguishes authenticity from synthesis — without theatrical friction. Trust becomes ambient infrastructure."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Agents inherit institutional policy.",
            "Humans carry cryptographic continuity.",
            "Every surface inherits quiet assurance.",
          ].map((line) => (
            <Card key={line} className={homeCard}>
              <p className="text-[15px] font-medium leading-snug text-keyra-primary">{line}</p>
            </Card>
          ))}
        </div>
      </NarrativeSection>

      {/* SECTION 10 — DEVELOPER PLATFORM */}
      <NarrativeSection
        id="developers"
        band="dark"
        eyebrow="Developer platform"
        title="API-first. Composed like infrastructure should be."
        lead="Documentation and primitives that treat trust as a craft — minimal surfaces, precise semantics, and clarity worthy of the institutions you serve."
      >
        <a
          href={keyraDeveloperPortalUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]"
        >
          <Button variant="secondary">Explore the developer platform</Button>
        </a>
      </NarrativeSection>

      {/* SECTION 11 — FINAL STATEMENT */}
      <section
        id="get-protected"
        className="keyra-section relative scroll-mt-[var(--keyra-header-offset)]"
        style={{ background: "linear-gradient(to bottom, #f0f2f5, #e8eaf0)" }}
        aria-labelledby="finale-heading"
      >
        <div className="mx-auto max-w-4xl relative">
          <div className="overflow-hidden rounded-[32px] border-[rgba(255,255,255,0.9)] bg-white px-5 py-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.12),0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-[0.35s] ease sm:px-12 sm:py-14 md:px-16 md:hover:-translate-y-2 md:hover:shadow-[0_40px_100px_rgba(0,0,0,0.15),0_20px_50px_rgba(0,0,0,0.1)]">
            <p className="keyra-eyebrow">Final statement</p>
            <h2 id="finale-heading" className="keyra-display-finale mx-auto mt-4 max-w-[18ch] text-balance">
              Be Protected Online.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-[1.65] text-keyra-text-2 sm:text-[17px]">
              Civilization-grade trust — rendered as calm infrastructure. Keyra is how the internet keeps its promises.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
