import { createVerificationPulse } from "@/lib/globe/createVerificationPulse";
import {
  DOT_DESPAWN_MS,
  DOT_LIFETIME_MS,
  LINK_DRAW_MS,
  ROAMING_HOME_DISTANCE_MAX_DEG,
  ROAMING_HOME_DISTANCE_MIN_DEG,
  ROAMING_LINE_RATE,
} from "@/lib/globe/globePulseConstants";
import { randomHomeFromSignIn } from "@/lib/globe/globePulsePositions";
import type { GlobePulse, GlobePulseEvent } from "@/lib/globe/types";

export function getDotAge(dotStartedAt: number, now = performance.now()) {
  return now - dotStartedAt;
}

export function getDotLifetimeFade(dotStartedAt: number, now = performance.now()) {
  const age = getDotAge(dotStartedAt, now);
  if (age >= DOT_LIFETIME_MS) return 0;
  const fadeStart = DOT_LIFETIME_MS - DOT_DESPAWN_MS;
  if (age >= fadeStart) {
    return 1 - (age - fadeStart) / DOT_DESPAWN_MS;
  }
  return 1;
}

export function getBatchDotFade(dotStartedAt: number, now = performance.now()) {
  return getDotLifetimeFade(dotStartedAt, now);
}

export function isLinkVisibleForPulses(
  fromStartedAt: number,
  toStartedAt: number,
  now = performance.now(),
) {
  return (
    getDotAge(fromStartedAt, now) < DOT_LIFETIME_MS &&
    getDotAge(toStartedAt, now) < DOT_LIFETIME_MS
  );
}

export function isRoamingLinkVisible(fromStartedAt: number, now = performance.now()) {
  return getDotAge(fromStartedAt, now) < DOT_LIFETIME_MS;
}

export function getLinkDrawProgress(
  fromStartedAt: number,
  toStartedAt: number,
  now = performance.now(),
) {
  const age = Math.min(getDotAge(fromStartedAt, now), getDotAge(toStartedAt, now));
  return Math.min(1, age / LINK_DRAW_MS);
}

export function getRoamingLinkDrawProgress(fromStartedAt: number, now = performance.now()) {
  return Math.min(1, getDotAge(fromStartedAt, now) / LINK_DRAW_MS);
}

export function getHomeMarkerPhase(drawProgress: number) {
  if (drawProgress < 0.45) return 0;
  return Math.min((drawProgress - 0.45) / 0.4, 1);
}

export function spawnPulseFromEvent(
  event: GlobePulseEvent,
  batchStartedAt: number,
  landMask: ImageData | null = null,
  eventPool: GlobePulseEvent[] | null = null,
): GlobePulse | null {
  const awayFromHome = Math.random() < ROAMING_LINE_RATE;
  let sourceEvent = event;

  if (awayFromHome && Array.isArray(eventPool) && eventPool.length) {
    const roamingEvents = eventPool.filter(
      (candidate) =>
        candidate?.roaming === true &&
        typeof candidate.latitude === "number" &&
        typeof candidate.longitude === "number",
    );
    if (roamingEvents.length) {
      sourceEvent = roamingEvents[Math.floor(Math.random() * roamingEvents.length)]!;
    }
  }

  const pulse = createVerificationPulse(sourceEvent, {
    globalRandom: !awayFromHome,
    useSignInCoords: awayFromHome,
    landMask,
  });
  if (!pulse) return null;

  const now = performance.now();
  pulse.batchStartedAt = batchStartedAt;
  pulse.startedAt = now;
  pulse.awayFromHome = awayFromHome;

  if (awayFromHome && typeof pulse.lat === "number" && typeof pulse.lon === "number") {
    const home = randomHomeFromSignIn(pulse.lat, pulse.lon, landMask, {
      minDeg: ROAMING_HOME_DISTANCE_MIN_DEG,
      maxDeg: ROAMING_HOME_DISTANCE_MAX_DEG,
    });
    pulse.homeLat = home.lat;
    pulse.homeLon = home.lon;
    pulse.homeDistanceDeg = home.distanceDeg;
    pulse.homeLabel = sourceEvent?.homeCountry || sourceEvent?.country || "Home";
  }

  return pulse;
}
