"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ActiveAuthenticationCountriesWidget } from "@/components/home/ActiveAuthenticationCountriesWidget";
import { ActiveSatProtocolsWidget } from "@/components/home/ActiveSatProtocolsWidget";
import { GlobalVerificationSignalsLive } from "@/components/home/GlobalVerificationSignalsLive";
import { KeyraHomeGlobe } from "@/components/home/KeyraHomeGlobe";
import { HomeRegistrationCTAs } from "@/components/registration/HomeRegistrationCTAs";
import { Button } from "@/components/ui/Button";
import { NarrativeLineCardGrid } from "@/components/home/narrative/NarrativeLineCardGrid";
import { NarrativeSection } from "@/components/home/narrative/NarrativeSection";
import {
  narrativeAudienceGridClass,
  narrativeEqualPanel,
} from "@/components/home/narrative/narrativeGrid";
import { HoverLiftCard } from "@/components/motion/HoverLiftCard";
import { keyraDeveloperPortalUrl, keyraGovernmentsUrl } from "@/lib/keyraAppUrls";
import {
  easeAnticipate,
  easeCircOut,
  heroEntrance,
  slideInRight,
  staggerContainer,
  staggerItem,
} from "@/lib/keyraMotion";

const homeCard = "keyra-home-card px-6 py-5";
const homeCardOnDark = "keyra-home-card keyra-surface-light px-6 py-5";
const homeAudienceCard = "keyra-card keyra-home-card p-7 sm:p-8";
const homeHeroPanel = "keyra-home-panel";

const heroCtaItems = [
  {
    t: "Protect Your Identity",
    d: "Secure your personal identity, mobile device, and digital presence with Keyra.",
    h: "/signup",
  },
  {
    t: "Protect Your Family",
    d: "Create a protected family identity registry for every family member.",
    h: "/app/family",
  },
  {
    t: "Secure Your Organization",
    d: "Protect your company domains, data, and team identities.",
    h: "/contact",
  },
  {
    t: "Partner With Keyra",
    d: "Join Keyra as a telecom, technology, or service partner.",
    h: "/partners",
  },
] as const;

export function HomeContent() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-white text-slate-900">
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{background:"radial-gradient(ellipse 55% 90% at 18% 55%,rgba(241,245,249,0.8) 0%,rgba(255,255,255,0.6) 40%,transparent 80%)"}} />
        <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.04]" aria-hidden style={{backgroundImage:"url('/image.png')",filter:"blur(60px)"}} />

        <div className="relative z-10 mx-auto max-w-[1440px] px-12 pb-16 pt-8 lg:px-20 lg:pb-20 lg:pt-12">
          <div>
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500"
              variants={heroEntrance}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
            >
              Sovereign trust infrastructure
            </motion.p>
            <motion.h1
              className="mt-5 text-[clamp(3rem,5.5vw,5.8rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
              variants={heroEntrance}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              transition={{ duration: reduceMotion ? 0.01 : 0.8, ease: easeCircOut, delay: reduceMotion ? 0 : 0.05 }}
            >
              Be Protected Online.
            </motion.h1>
            <motion.p
              className="mt-5 max-w-lg text-[15px] leading-[1.65] text-slate-400"
              variants={heroEntrance}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              transition={{ duration: reduceMotion ? 0.01 : 0.8, ease: easeCircOut, delay: reduceMotion ? 0 : 0.14 }}
            >
              The internet finally became trustworthy — calm, deterministic identity for people, institutions, and verified intelligence.
            </motion.p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* LEFT: Globe */}
            <motion.div
              className="relative lg:-ml-12 xl:-ml-20"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: easeAnticipate, delay: reduceMotion ? 0 : 0.2 }}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 keyra-globe-orbit-ring rounded-full border border-blue-400/15"
                aria-hidden
                style={{ width: "128%", height: "128%" }}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-hidden
                style={{
                  width: "120%",
                  height: "120%",
                  background:
                    "radial-gradient(circle,rgba(59,130,246,0.12) 0%,rgba(37,99,235,0.03) 50%,transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              <motion.div
                className="relative mx-auto w-full max-w-[500px] lg:max-w-[440px] xl:max-w-[500px]"
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                transition={{ duration: 0.45, ease: easeCircOut }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-full">
                  <KeyraHomeGlobe className="block h-full w-full touch-pan-y" />
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT: Timeline + widgets, then 4 CTAs directly below */}
            <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,15.5rem)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                {/* Timeline */}
                <div className="lg:pt-1">
                  <div className="flex flex-col gap-6">
                    {[{l:"Who this is for",t:"Households, professionals, and institutions who live and work online."},{l:"Problem",t:"Identity is fragmented; fraud and synthetic deception are routine."},{l:"What to do next",t:"Continue below, or sign in to manage your Keyra account."}].map((item,i)=>(
                      <div key={item.l} className="flex items-start gap-8">
                        {/* Stepper dot + line */}
                        <div className="relative flex w-5 flex-col items-center self-stretch pt-[5px]">
                          {i > 0 && (
                            <div
                              className="absolute left-1/2 w-px -translate-x-1/2 bg-slate-300/50"
                              style={{ bottom: 'calc(100% - 10px)', height: '22px' }}
                            />
                          )}
                          <div className={`relative z-10 h-2.5 w-2.5 rounded-full ${i===0?'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]':i===1?'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]':'bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.4)]'}`} />
                          {i < 2 && (
                            <div
                              className={`absolute left-1/2 top-[10px] w-px -translate-x-1/2 ${i===0?'bg-gradient-to-b from-blue-500/50 to-slate-300/40':'bg-slate-300/50'}`}
                              style={{ height: 'calc(100% + 2px)' }}
                            />
                          )}
                        </div>

                        <motion.div
                          className={`flex-1 ${homeHeroPanel} px-5 py-4`}
                          variants={slideInRight}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.55, delay: 0.2 + i * 0.08, ease: easeCircOut }}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.l}</p>
                          <p className="mt-2 text-[13px] leading-[1.6] text-slate-600">{item.t}</p>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widgets */}
                <div className="flex flex-col gap-3 lg:pt-1">
                  <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.35,ease:easeCircOut}}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Global verification signals</p>
                    <GlobalVerificationSignalsLive variant="hero" />
                    <div className="mt-3 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-2 text-center"><span className="text-[11px] text-slate-500">Global numbers verified — live by region</span></div>
                  </motion.div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.42,ease:easeCircOut}}>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Latest authentications</p>
                      <ActiveAuthenticationCountriesWidget />
                    </motion.div>
                    <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.48,ease:easeCircOut}}>
                      <ActiveSatProtocolsWidget />
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                variants={staggerContainer}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
                transition={{ delay: reduceMotion ? 0 : 0.45 }}
              >
                {heroCtaItems.map((item) => (
                  <motion.div key={item.t} variants={staggerItem}>
                    <Link href={item.h} className="group block h-full">
                      <div className={`h-full ${homeHeroPanel} p-6`}>
                        <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{item.t}</h3>
                        <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">{item.d}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE COLLAPSE */}
      <NarrativeSection
        id="problem"
        band="dark"
        eyebrow="The collapse"
        title="The internet lost identity."
        lead="We built connection without certainty. Fraud, impersonation, and synthetic voices spread where proof should live — and hesitation became normal."
      >
        <NarrativeLineCardGrid
          lines={[
            "Uncertainty replaced recognition.",
            "Trust became probabilistic.",
            "Humans and agents blurred.",
            "Institutions needed proof, not patches.",
          ]}
          cardClassName={homeCardOnDark}
          columns={2}
        />
      </NarrativeSection>

      {/* SECTION 3 — THE SHIFT */}
      <NarrativeSection
        id="missing-layer"
        band="light"
        eyebrow="The shift"
        title="AI changed the internet forever."
        lead="Generative scale collided with ambiguous identity. The next era requires orchestration between verified humans, verified systems, and verified carriers — not louder alerts."
      >
        <NarrativeLineCardGrid
          lines={[
            "Human + AI trust is now infrastructure.",
            "Proof must travel with the interaction.",
            "Calm defaults beat frantic friction.",
          ]}
          cardClassName={homeCard}
          columns={3}
        />
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
        <NarrativeLineCardGrid
          lines={[
            "SIM / eSIM identity verification",
            "Secure carrier-scale authentication",
            "Cryptographic trust orchestration",
            "Identity signal intelligence",
            "Deterministic verification routing",
            "Institutional continuity — calm by default",
          ]}
          cardClassName={homeCardOnDark}
          columns={3}
          density="compact"
        />
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
        eyebrow="Who it’s for"
        title="Everyone who depends on certainty."
        lead="One quiet standard across households, enterprises, and nations — verification that feels human because it is mathematically composed."
      >
        <div className={narrativeAudienceGridClass}>
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
            <HoverLiftCard key={item.title} className={narrativeEqualPanel(homeAudienceCard)}>
              <p className="keyra-eyebrow text-[10px]">{item.title}</p>
              <h3 className="mt-4 text-balance text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">
                {item.headline}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">{item.body}</p>
            </HoverLiftCard>
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
        <NarrativeLineCardGrid
          lines={[
            "Agents inherit institutional policy.",
            "Humans carry cryptographic continuity.",
            "Every surface inherits quiet assurance.",
          ]}
          cardClassName={homeCard}
          columns={3}
        />
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
        className="keyra-band--light keyra-section scroll-mt-44 pb-28 sm:scroll-mt-24 sm:pb-36"
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
            <div className="keyra-card keyra-home-card mx-auto mt-14 max-w-xl px-5 py-8 sm:px-8">
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
