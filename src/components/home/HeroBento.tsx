"use client";

import { motion } from "framer-motion";
import { KeyraHomeGlobe } from "@/components/home/KeyraHomeGlobe";
import {
  HeroKeyraCtaGrid,
  HeroKeyraTimeline,
  HeroKeyraWidgets,
} from "@/components/home/HeroKeyraInsights";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

type HeroBentoProps = {
  clientReady: boolean;
};

export function HeroBento({ clientReady }: HeroBentoProps) {
  return (
    <section className="keyra-hero-bento relative overflow-hidden">
      <div className="keyra-hero-bento__bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="keyra-hero-bento__glow animate-keyra-hero-glow pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-[1440px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="keyra-hero-bento__grid min-w-0">
          {/* Left 2/3 — headline + globe fills the card */}
          <motion.div
            className="keyra-bento-globe-card lg:col-span-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeTrust }}
          >
            <div className="keyra-bento-globe-card__scene" aria-hidden>
              <div className="keyra-bento-globe-card__orb">
                <KeyraHomeGlobe className="block h-full w-full touch-pan-y" opaque />
              </div>
            </div>
            <div className="keyra-bento-globe-card__veil pointer-events-none" aria-hidden />
            <div className="keyra-bento-globe-card__content">
              <p className="keyra-bento-eyebrow">Sovereign trust infrastructure</p>
              <h1 className="keyra-bento-title">Be Protected Online.</h1>
              <p className="keyra-bento-lead">
                The internet finally became trustworthy — calm, deterministic identity for people,
                institutions, and verified intelligence.
              </p>
              <div className="keyra-bento-support">
                <p>
                  Keyra composes carrier-scale SIM and eSIM signals with cryptographic verification —
                  structured proof instead of probabilistic guesswork.
                </p>
                <p>
                  One calm layer for households, enterprises, and sovereign institutions — identity
                  you can recognize, route, and trust.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right 1/3 — glass widgets */}
          <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-4 lg:min-h-0 xl:min-h-[440px]">
            <HeroKeyraWidgets clientReady={clientReady} variant="bento" />
          </div>

          {/* Timeline — three compact bento cells, full width */}
          <div className="lg:col-span-12">
            <HeroKeyraTimeline variant="bento" />
          </div>

          {/* Bottom row — four equal service cards */}
          <div className="lg:col-span-12">
            <HeroKeyraCtaGrid variant="bento" />
          </div>
        </div>
      </div>
    </section>
  );
}
