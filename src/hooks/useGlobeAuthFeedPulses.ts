"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobeAuthFeedContext } from "@/contexts/GlobeAuthFeedContext";
import { authRecordToGlobeEvent } from "@/lib/globe/authRecordToGlobeEvent";
import { createVerificationPulse } from "@/lib/globe/createVerificationPulse";
import {
  DOT_LIFETIME_MS,
  ROAMING_HOME_DISTANCE_MAX_DEG,
  ROAMING_HOME_DISTANCE_MIN_DEG,
} from "@/lib/globe/globePulseConstants";
import { randomHomeFromSignIn } from "@/lib/globe/globePulsePositions";
import { syncPulseLinks } from "@/lib/globe/globePulseNetwork";
import { preloadLandMask } from "@/lib/globe/landDetection";
import type { GlobePulse, GlobePulseLink } from "@/lib/globe/types";

/**
 * Spawns globe dots when Latest authentications prepends a row — same country and protocol color as the feed.
 */
export function useGlobeAuthFeedPulses() {
  const feedContext = useGlobeAuthFeedContext();
  const [activePulses, setActivePulses] = useState<GlobePulse[]>([]);
  const [activeLinks, setActiveLinks] = useState<GlobePulseLink[]>([]);
  const landMaskRef = useRef<ImageData | null>(null);

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

    const pushPulse = (pulse: GlobePulse) => {
      setActivePulses((prev) => {
        const next = [...prev, pulse];
        setActiveLinks((links) => syncPulseLinks(next, links));
        return next;
      });
    };

    const onAuthRecord = (record: Parameters<typeof authRecordToGlobeEvent>[0]) => {
      void authRecordToGlobeEvent(record).then((event) => {
        if (!event) return;

        const pulse = createVerificationPulse(event, { globalRandom: false });
        if (!pulse) return;

        const now = performance.now();
        pulse.startedAt = now;
        pulse.batchStartedAt = now;
        pulse.awayFromHome = event.roaming === true;

        if (event.roaming && Number.isFinite(pulse.lat) && Number.isFinite(pulse.lon)) {
          const home = randomHomeFromSignIn(pulse.lat, pulse.lon, landMaskRef.current, {
            minDeg: ROAMING_HOME_DISTANCE_MIN_DEG,
            maxDeg: ROAMING_HOME_DISTANCE_MAX_DEG,
          });
          pulse.homeLat = home.lat;
          pulse.homeLon = home.lon;
          pulse.homeDistanceDeg = home.distanceDeg;
          pulse.homeLabel = event.homeCountry || event.country || "Home";
        }

        pushPulse(pulse);
      });
    };

    return feedContext.subscribe(onAuthRecord);
  }, [feedContext]);

  useEffect(() => {
    if (!feedContext) return undefined;

    const pruneId = window.setInterval(() => {
      const now = performance.now();
      setActivePulses((prev) => {
        const next = prev.filter((pulse) => now - pulse.startedAt < DOT_LIFETIME_MS);
        setActiveLinks((links) => syncPulseLinks(next, links));
        return next;
      });
    }, 80);

    return () => window.clearInterval(pruneId);
  }, [feedContext]);

  if (!feedContext) {
    return { activePulses: [] as GlobePulse[], activeLinks: [] as GlobePulseLink[], synced: false };
  }

  return { activePulses, activeLinks, synced: true };
}
