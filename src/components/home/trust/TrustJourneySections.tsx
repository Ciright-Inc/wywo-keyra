"use client";

import { TRUST_JOURNEY_GROUPS } from "@/lib/trustJourney";
import { TrustJourneyGroupSection } from "./TrustJourneyGroupSection";
import { useTrustJourneyHashSync } from "./useTrustJourneyNavigation";

/**
 * Two full-width bands — each holds two trust journey panels (four hero cards total).
 */
export function TrustJourneySections() {
  useTrustJourneyHashSync();

  return (
    <div className="keyra-trust-journey" aria-label="Trust journey">
      {TRUST_JOURNEY_GROUPS.map((group, index) => (
        <TrustJourneyGroupSection key={group.anchors.join("-")} group={group} groupIndex={index} />
      ))}
    </div>
  );
}
