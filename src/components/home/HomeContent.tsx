"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ActiveAuthenticationCountriesWidget } from "@/components/home/ActiveAuthenticationCountriesWidget";
import { ActiveSatProtocolsWidget } from "@/components/home/ActiveSatProtocolsWidget";
import { KeyraHomeGlobe } from "@/components/home/KeyraHomeGlobe";
import { HomeRegistrationCTAs } from "@/components/registration/HomeRegistrationCTAs";
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
  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-white text-slate-900">
        <div className="pointer-events-none absolute inset-0" aria-hidden style={{background:"radial-gradient(ellipse 55% 90% at 18% 55%,rgba(241,245,249,0.8) 0%,rgba(255,255,255,0.6) 40%,transparent 80%)"}} />
        <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.04]" aria-hidden style={{backgroundImage:"url('/image.png')",filter:"blur(60px)"}} />

        <div className="relative z-10 mx-auto max-w-[1440px] px-[var(--keyra-space-section-x)] py-10 sm:py-14">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:easeTrust}}>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Sovereign trust infrastructure</p>
            <h1 className="mt-5 text-[clamp(3rem,5.5vw,5.8rem)] font-semibold leading-[1.05] tracking-[-0.03em]">Be Protected Online.</h1>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.65] text-slate-400">The internet finally became trustworthy — calm, deterministic identity for people, institutions, and verified intelligence.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* LEFT: Globe */}
            <div className="relative lg:-ml-16 xl:-ml-24">
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden style={{width:"120%",height:"120%",background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,rgba(37,99,235,0.03) 50%,transparent 70%)",filter:"blur(40px)"}} />
              <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
                <div className="relative aspect-square w-full overflow-hidden rounded-full">
                  <KeyraHomeGlobe className="block h-full w-full touch-pan-y" />
                </div>
              </div>
            </div>

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

                        <motion.div className={`flex-1 ${homeHeroPanel} px-5 py-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.2+i*0.08,ease:easeTrust}}>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.l}</p>
                          <p className="mt-2 text-[13px] leading-[1.6] text-slate-600">{item.t}</p>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widgets */}
                <div className="flex flex-col gap-3 lg:pt-1">
                  <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.35,ease:easeTrust}}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Global verification signals</p>
                    <p className="mt-3 font-mono text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums text-slate-900">2,801,077</p>
                    <div className="mt-3 flex gap-5">
                      <div><p className="font-mono text-xs font-medium tabular-nums text-slate-900">4,822</p><p className="text-[10px] text-slate-500">Per second</p></div>
                      <div><p className="font-mono text-xs font-medium tabular-nums text-slate-900">289,320</p><p className="text-[10px] text-slate-500">Per minute</p></div>
                    </div>
                    <div className="mt-3 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-2 text-center"><span className="text-[11px] text-slate-500">Global numbers verified — live by region</span></div>
                  </motion.div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.42,ease:easeTrust}}>
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">Latest authentications</p>
                      <ActiveAuthenticationCountriesWidget />
                    </motion.div>
                    <motion.div className={`${homeHeroPanel} p-4`} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.48,ease:easeTrust}}>
                      <ActiveSatProtocolsWidget />
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.5,ease:easeTrust}}>
                {[{t:"Protect Your Identity",d:"Secure your personal identity, mobile device, and digital presence with Keyra.",h:"/signup"},{t:"Protect Your Family",d:"Create a protected family identity registry for every family member.",h:"/app/family"},{t:"Secure Your Organization",d:"Protect your company domains, data, and team identities.",h:"/contact"},{t:"Partner With Keyra",d:"Join Keyra as a telecom, technology, or service partner.",h:"/partners"}].map(item=>(
                  <Link key={item.t} href={item.h} className="group block">
                    <div className={`h-full ${homeHeroPanel} p-6`}>
                      <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{item.t}</h3>
                      <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">{item.d}</p>
                    </div>
                  </Link>
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
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-3 sm:gap-4">
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
        band="light"
        eyebrow="Human + AI trust"
        title="Verified agents. Verified humans. Verified interactions."
        lead="Orchestration that distinguishes authenticity from synthesis — without theatrical friction. Trust becomes ambient infrastructure."
      >
        <div className="grid w-full max-w-5xl gap-3 sm:grid-cols-3">
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
        className="keyra-section relative scroll-mt-44 sm:scroll-mt-24"
        style={{ background: "linear-gradient(to bottom, #f0f2f5, #e8eaf0)" }}
        aria-labelledby="finale-heading"
      >
        <div className="mx-auto max-w-4xl relative">
          <div className="overflow-hidden rounded-[32px] border-[rgba(255,255,255,0.9)] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12),0_16px_40px_rgba(0,0,0,0.08)] px-8 py-12 text-center sm:px-12 sm:py-14 md:px-16 transition-all duration-[0.35s] ease hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(0,0,0,0.15),0_20px_50px_rgba(0,0,0,0.1)]">
            <p className="keyra-eyebrow">Final statement</p>
            <h2 id="finale-heading" className="keyra-display-finale mx-auto mt-4 max-w-[18ch] text-balance">
              Be Protected Online.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-[1.65] text-keyra-text-2 sm:text-[17px]">
              Civilization-grade trust — rendered as calm infrastructure. Keyra is how the internet keeps its promises.
            </p>
            <div className="keyra-card keyra-home-card mx-auto mt-10 max-w-xl px-5 py-6 sm:px-8">
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
