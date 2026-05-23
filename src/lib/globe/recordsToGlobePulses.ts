import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { authRecordToGlobeEvent } from "@/lib/globe/authRecordToGlobeEvent";
import { createVerificationPulse } from "@/lib/globe/createVerificationPulse";
import {
  ROAMING_HOME_DISTANCE_MAX_DEG,
  ROAMING_HOME_DISTANCE_MIN_DEG,
} from "@/lib/globe/globePulseConstants";
import { randomHomeFromSignIn } from "@/lib/globe/globePulsePositions";
import type { GlobePulse } from "@/lib/globe/types";

function recordPulseId(record: LatestAuthRecord, index: number): string {
  return `auth-feed-${record.t}-${record.x}-${index}`;
}

/** One globe dot per Latest authentications row (country + protocol color). */
export async function recordsToGlobePulses(
  records: LatestAuthRecord[],
  landMask: ImageData | null = null,
): Promise<GlobePulse[]> {
  const pulses: GlobePulse[] = [];
  const countrySlot = new Map<string, number>();
  const now = performance.now();

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]!;
    const event = await authRecordToGlobeEvent(record);
    if (!event) continue;

    const pulse = createVerificationPulse(event, { globalRandom: false });
    if (!pulse) continue;

    const countryKey = record.c.trim().toLowerCase();
    const slot = countrySlot.get(countryKey) ?? 0;
    countrySlot.set(countryKey, slot + 1);
    if (slot > 0) {
      const ring = slot % 6;
      const angle = (ring / 6) * Math.PI * 2;
      pulse.lat += Math.sin(angle) * 1.4;
      pulse.lon += Math.cos(angle) * 2.1;
      pulse.lat = Math.max(-85, Math.min(85, pulse.lat));
      pulse.lon = ((pulse.lon + 180) % 360) - 180;
    }

    pulse.id = recordPulseId(record, index);
    pulse.startedAt = now;
    pulse.batchStartedAt = now;
    pulse.awayFromHome = event.roaming === true;

    if (event.roaming && Number.isFinite(pulse.lat) && Number.isFinite(pulse.lon)) {
      const home = randomHomeFromSignIn(pulse.lat, pulse.lon, landMask, {
        minDeg: ROAMING_HOME_DISTANCE_MIN_DEG,
        maxDeg: ROAMING_HOME_DISTANCE_MAX_DEG,
      });
      pulse.homeLat = home.lat;
      pulse.homeLon = home.lon;
      pulse.homeDistanceDeg = home.distanceDeg;
      pulse.homeLabel = event.homeCountry || event.country || "Home";
    }

    pulses.push(pulse);
  }

  return pulses;
}
