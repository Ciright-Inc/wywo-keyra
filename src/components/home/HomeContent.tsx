"use client";

import { HeroBento } from "@/components/home/HeroBento";
import { FadeIn } from "@/components/motion/FadeIn";
import { HoverLift } from "@/components/motion/HoverLift";
import { useClientReady } from "@/lib/useClientReady";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NarrativeSection } from "@/components/home/narrative/NarrativeSection";
import {
  narrativeAudienceGridClass,
  narrativeCardGridClass,
  narrativeEqualCard,
  narrativeEqualPanel,
  narrativeLineTextCompactClass,
  narrativeLineTextDefaultClass,
} from "@/components/home/narrative/narrativeGrid";
import { keyraDeveloperPortalUrl, keyraGovernmentsUrl } from "@/lib/keyraAppUrls";

const homeCard = "keyra-home-card keyra-home-card--lift px-6 py-5";
const homeCardOnDark = "keyra-home-card keyra-home-card--lift px-6 py-5";
const homeAudienceCard = "keyra-card keyra-home-card keyra-home-card--lift p-7 sm:p-8";

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
        stagger
        childrenClassName={narrativeCardGridClass(2)}
        eyebrow="The collapse"
        title="The internet lost identity."
        lead="We built connection without certainty. Fraud, impersonation, and synthetic voices spread where proof should live — and hesitation became normal."
      >
        {[
          "Uncertainty replaced recognition.",
          "Trust became probabilistic.",
          "Humans and agents blurred.",
          "Institutions needed proof, not patches.",
        ].map((line) => (
          <Card key={line} className={narrativeEqualCard(homeCardOnDark)}>
            <p className={narrativeLineTextDefaultClass}>{line}</p>
          </Card>
        ))}
      </NarrativeSection>

      {/* SECTION 3 — THE SHIFT */}
      <NarrativeSection
        id="missing-layer"
        band="light"
        stagger
        eyebrow="The shift"
        title="AI changed the internet forever."
        lead="Generative scale collided with ambiguous identity. The next era requires orchestration between verified humans, verified systems, and verified carriers — not louder alerts."
        childrenClassName={narrativeCardGridClass(3)}
      >
        {[
          "Human + AI trust is now infrastructure.",
          "Proof must travel with the interaction.",
          "Calm defaults beat frantic friction.",
        ].map((line) => (
          <Card key={line} className={narrativeEqualCard(homeCard)}>
            <p className={narrativeLineTextDefaultClass}>{line}</p>
          </Card>
        ))}
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
        stagger
        childrenClassName={narrativeCardGridClass(3)}
        eyebrow="Trust visualization"
        title="Invisible systems, rendered with restraint."
        lead="Protection expressed as atmosphere — signal choreography instead of noise. Identity pulses quietly across carrier paths, hardware truth, and institutional policy."
      >
        {[
          "SIM / eSIM identity verification",
          "Secure carrier-scale authentication",
          "Cryptographic trust orchestration",
          "Identity signal intelligence",
          "Deterministic verification routing",
          "Institutional continuity — calm by default",
        ].map((line) => (
          <Card key={line} className={narrativeEqualCard(homeCardOnDark)}>
            <p className={narrativeLineTextCompactClass}>{line}</p>
          </Card>
        ))}
      </NarrativeSection>

      {/* SECTION 7 — GLOBAL */}
      <NarrativeSection
        id="global"
        band="light"
        eyebrow="Global infrastructure"
        title="Carrier-scale architecture for national resilience."
        lead="Built in Ireland as a trust institution for the digital age — composed for global deployment without compromising sovereignty or clarity."
      >
        <a
          href={keyraGovernmentsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]"
        >
          <Button variant="secondary">View global deployment</Button>
        </a>
      </NarrativeSection>

      {/* SECTION 8 — WHO IT'S FOR */}
      <NarrativeSection
        id="for"
        band="dark"
        stagger
        childrenClassName={narrativeAudienceGridClass}
        eyebrow="Who it’s for"
        title="Everyone who depends on certainty."
        lead="One quiet standard across households, enterprises, and nations — verification that feels human because it is mathematically composed."
      >
        {[
          {
            title: "Individuals",
            headline: "Know who you are connecting with.",
            body: "Identity should protect you — everywhere you go online.",
          },
          {
            title: "Families",
            headline: "Protect those who don’t see every risk.",
            body: "Peace of mind for the people you care about most.",
          },
          {
            title: "Businesses",
            headline: "Build trust in every interaction.",
            body: "Reduce fraud. Elevate confidence. Protect your brand.",
          },
          {
            title: "Governments",
            headline: "Sovereign digital identity.",
            body: "Infrastructure for citizens, institutions, and national continuity.",
          },
        ].map((item) => (
          <div key={item.title} className={narrativeEqualPanel(homeAudienceCard)}>
            <p className="keyra-eyebrow text-[10px]">{item.title}</p>
            <h3 className="mt-4 text-balance text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">
              {item.headline}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">{item.body}</p>
          </div>
        ))}
      </NarrativeSection>

      {/* SECTION 9 — HUMAN + AI */}
      <NarrativeSection
        id="human-ai"
        band="light"
        stagger
        childrenClassName={narrativeCardGridClass(3)}
        eyebrow="Human + AI trust"
        title="Verified agents. Verified humans. Verified interactions."
        lead="Orchestration that distinguishes authenticity from synthesis — without theatrical friction. Trust becomes ambient infrastructure."
      >
        {[
          "Agents inherit institutional policy.",
          "Humans carry cryptographic continuity.",
          "Every surface inherits quiet assurance.",
        ].map((line) => (
          <Card key={line} className={narrativeEqualCard(homeCard)}>
            <p className={narrativeLineTextDefaultClass}>{line}</p>
          </Card>
        ))}
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
          <FadeIn>
            <HoverLift>
              <div className="keyra-finale-card overflow-hidden rounded-[32px] border-[rgba(255,255,255,0.9)] bg-white px-5 py-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.12),0_16px_40px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14 md:px-16">
                <p className="keyra-eyebrow">Final statement</p>
                <h2 id="finale-heading" className="keyra-display-finale mx-auto mt-4 max-w-[18ch] text-balance">
                  Be Protected Online.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-[1.65] text-keyra-text-2 sm:text-[17px]">
                  Civilization-grade trust — rendered as calm infrastructure. Keyra is how the internet keeps its promises.
                </p>
              </div>
            </HoverLift>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
