"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobeAuthFeedContext } from "@/contexts/GlobeAuthFeedContext";
import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { recordsToGlobePulses } from "@/lib/globe/recordsToGlobePulses";
import { syncPulseLinks } from "@/lib/globe/globePulseNetwork";
import { preloadLandMask } from "@/lib/globe/landDetection";
import type { GlobePulse, GlobePulseLink } from "@/lib/globe/types";

/**
 * Shows one globe dot per row in Latest authentications (all visible countries at once).
 */
export function useGlobeAuthFeedPulses() {
  const feedContext = useGlobeAuthFeedContext();
  const [activePulses, setActivePulses] = useState<GlobePulse[]>([]);
  const [activeLinks, setActiveLinks] = useState<GlobePulseLink[]>([]);
  const landMaskRef = useRef<ImageData | null>(null);
  const syncGenerationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    preloadLandMask().then((mask) => {
      if (!cancelled) landMaskRef.current = mask;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!feedContext) return undefined;

    const applyRecords = (records: LatestAuthRecord[]) => {
      const generation = syncGenerationRef.current + 1;
      syncGenerationRef.current = generation;

      void recordsToGlobePulses(records, landMaskRef.current).then((pulses) => {
        if (syncGenerationRef.current !== generation) return;
        setActivePulses(pulses);
        setActiveLinks(syncPulseLinks(pulses, []));
      });
    };

    return feedContext.subscribeRecordsSync(applyRecords);
  }, [feedContext]);

  if (!feedContext) {
    return { activePulses: [] as GlobePulse[], activeLinks: [] as GlobePulseLink[], synced: false };
  }

  return { activePulses, activeLinks, synced: true };
}
