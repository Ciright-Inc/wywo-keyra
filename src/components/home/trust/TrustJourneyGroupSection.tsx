"use client";

import type { TrustJourneyGroup } from "@/lib/trustJourney";
import { TRUST_JOURNEY_SECTION_BY_ANCHOR } from "@/lib/trustJourney";
import { TrustJourneyPanel } from "./TrustJourneyPanel";

type TrustJourneyGroupSectionProps = {
  group: TrustJourneyGroup;
  groupIndex: number;
};

export function TrustJourneyGroupSection({ group, groupIndex }: TrustJourneyGroupSectionProps) {
  const bandClass = group.band === "dark" ? "keyra-band--dark" : "keyra-band--light";

  return (
    <section
      className={`keyra-trust-journey-section keyra-section ${bandClass}`}
      aria-label={`Trust journey — ${group.anchors.map((a) => TRUST_JOURNEY_SECTION_BY_ANCHOR[a].headline).join(" and ")}`}
    >
      <div className="keyra-trust-journey-group__grid mx-auto w-full min-w-0 max-w-6xl">
        {group.anchors.map((anchor, panelIndex) => (
          <TrustJourneyPanel
            key={anchor}
            section={TRUST_JOURNEY_SECTION_BY_ANCHOR[anchor]}
            band={group.band}
            revealDelay={groupIndex * 0.04 + panelIndex * 0.06}
          />
        ))}
      </div>
    </section>
  );
}
