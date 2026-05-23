"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/components/ui/cn";
import type { TrustJourneyDeepSection } from "@/lib/trustJourney";
import { TRUST_JOURNEY_CARDS } from "@/lib/trustJourney";
import { AccessKeyraButton } from "./AccessKeyraButton";

const cardByAnchor = Object.fromEntries(
  TRUST_JOURNEY_CARDS.map((c) => [c.anchor, c]),
) as Record<TrustJourneyDeepSection["anchor"], (typeof TRUST_JOURNEY_CARDS)[number]>;

type TrustJourneyPanelProps = {
  section: TrustJourneyDeepSection;
  band: "light" | "dark";
  revealDelay?: number;
};

export function TrustJourneyPanel({ section, band, revealDelay = 0 }: TrustJourneyPanelProps) {
  const card = cardByAnchor[section.anchor];
  const Icon = card.icon;

  return (
    <FadeIn delay={revealDelay} className="h-full min-h-0">
      <article
        id={section.anchor}
        className={cn(
          "keyra-home-panel keyra-trust-journey-panel h-full scroll-mt-[var(--keyra-header-offset)]",
          band === "dark" && "keyra-surface-light",
          band === "light" && "keyra-trust-panel--ink",
        )}
        aria-labelledby={`${section.anchor}-headline`}
      >
        <div className="keyra-trust-journey-panel__body">
          <header className="keyra-trust-journey-panel__header">
            <div className="keyra-trust-journey-panel__meta">
              <span className="keyra-trust-journey-panel__icon" aria-hidden>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="keyra-trust-journey-panel__tag">{card.tag}</span>
            </div>
            <h2
              id={`${section.anchor}-headline`}
              className="keyra-trust-journey-panel__title text-balance"
            >
              {section.headline}
            </h2>
            <p className="keyra-trust-journey-panel__lead text-pretty">{section.subheadline}</p>
          </header>

          <div className="keyra-trust-journey-panel__divider" aria-hidden />

          <div className="keyra-trust-journey-panel__copy">
            <p className="keyra-trust-journey-panel__body-text text-pretty">{section.body}</p>
            {section.bodySecondary ? (
              <p className="keyra-trust-journey-panel__note text-pretty">{section.bodySecondary}</p>
            ) : null}
          </div>

          <div className="keyra-trust-journey-panel__features">
            <p className="keyra-trust-journey-panel__features-label">Trust capabilities</p>
            <ul className="keyra-trust-journey-panel__bullets">
              {section.bullets.map((bullet) => (
                <li key={bullet}>
                  <span className="keyra-trust-journey-panel__bullet-mark" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="keyra-trust-journey-panel__footer">
          <AccessKeyraButton
            section={section.anchor}
            variant={band === "light" ? "secondary" : "primary"}
          />
        </footer>
      </article>
    </FadeIn>
  );
}
