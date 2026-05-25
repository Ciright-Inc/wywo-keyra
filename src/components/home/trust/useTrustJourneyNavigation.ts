"use client";

import { useEffect } from "react";
import { trackPlausible } from "@/lib/analytics";
import {
  isTrustJourneyAnchor,
  scrollToTrustAnchor,
  type TrustJourneyAnchor,
  type TrustJourneyCard,
} from "@/lib/trustJourney";

export function openTrustJourney(card: TrustJourneyCard): void {
  trackPlausible(card.moduleOpenEvent);
  scrollToTrustAnchor(card.anchor);
}

/** Sync deep-link hashes on load and when the hash changes. */
export function useTrustJourneyHashSync(): void {
  useEffect(() => {
    const syncHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!isTrustJourneyAnchor(raw)) return;
      requestAnimationFrame(() => {
        scrollToTrustAnchor(raw, { updateHash: false });
      });
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
}

export function openTrustJourneyByAnchor(
  anchor: TrustJourneyAnchor,
  moduleOpenEvent: string,
): void {
  trackPlausible(moduleOpenEvent);
  scrollToTrustAnchor(anchor);
}
