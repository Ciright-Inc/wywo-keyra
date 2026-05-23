"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HeroVariant } from "@/components/home/heroTypes";
import { TRUST_JOURNEY_CARDS, type TrustJourneyIcon } from "@/lib/trustJourney";
import { openTrustJourney } from "./useTrustJourneyNavigation";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

type TrustJourneyHeroCardsProps = {
  variant?: HeroVariant;
};

export function TrustJourneyHeroCards({ variant = "bento" }: TrustJourneyHeroCardsProps) {
  const reduceMotion = useReducedMotion();

  if (variant !== "bento") {
    return (
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: easeTrust }}
      >
        {TRUST_JOURNEY_CARDS.map((item) => (
          <TrustJourneyCardButton
            key={item.anchor}
            item={item}
            onActivate={() => openTrustJourney(item)}
            variant="default"
            reduceMotion={reduceMotion}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="keyra-bento-cta-row"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.48, ease: easeTrust }}
      role="list"
      aria-label="Trust journey entry points"
    >
      {TRUST_JOURNEY_CARDS.map((item, i) => (
        <TrustJourneyCardButton
          key={item.anchor}
          item={item}
          onActivate={() => openTrustJourney(item)}
          variant="bento"
          reduceMotion={reduceMotion}
          delay={0.52 + i * 0.04}
        />
      ))}
    </motion.div>
  );
}

function TrustJourneyCardButton({
  item,
  onActivate,
  variant,
  reduceMotion,
  delay = 0,
}: {
  item: (typeof TRUST_JOURNEY_CARDS)[number];
  onActivate: () => void;
  variant: "bento" | "default";
  reduceMotion: boolean | null;
  delay?: number;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  if (variant === "bento") {
    return (
      <motion.button
        type="button"
        role="listitem"
        className="keyra-bento-glass keyra-bento-cta-card keyra-bento-cta-card--interactive group h-full text-left"
        onClick={onActivate}
        onKeyDown={handleKeyDown}
        aria-label={`${item.title} — enter trust journey`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: easeTrust }}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      >
        <div className="flex items-start justify-between gap-3">
          <TrustCardIcon icon={item.icon} pulseOnHover />
          <span className="keyra-bento-tag">{item.tag}</span>
        </div>
        <h3 className="keyra-bento-cta-card__title keyra-bento-cta-card__title--interactive">
          {item.title}
        </h3>
        <p className="keyra-bento-cta-card__desc">{item.description}</p>
        <span className="keyra-bento-cta-card__link" aria-hidden>
          Enter Journey →
        </span>
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      className="keyra-hero-insight keyra-hero-insight--interactive group flex h-full flex-col p-6 text-left"
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      aria-label={`${item.title} — enter trust journey`}
    >
      <div className="flex items-start justify-between gap-3">
        <TrustCardIcon icon={item.icon} />
        <span className="keyra-hero-tag">{item.tag}</span>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-[var(--color-ink)]">
        {item.title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-[var(--color-body)]">
        {item.description}
      </p>
      <span className="keyra-bento-cta-card__link mt-4 text-[11px] font-semibold text-[var(--color-primary)] opacity-100">
        Enter Journey →
      </span>
    </button>
  );
}

function TrustCardIcon({
  icon: Icon,
  pulseOnHover = false,
}: {
  icon: TrustJourneyIcon;
  pulseOnHover?: boolean;
}) {
  return (
    <span
      className={`keyra-bento-icon ${pulseOnHover ? "keyra-bento-icon--pulse-hover" : ""}`}
      aria-hidden
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}
