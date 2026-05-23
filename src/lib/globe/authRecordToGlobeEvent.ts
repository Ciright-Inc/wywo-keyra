import type { LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { coordsForCountry } from "@/lib/globe/countryCoords";
import type { GlobePulseEvent } from "@/lib/globe/types";

/** Map a Latest authentications row to a globe pulse event at that country. */
export async function authRecordToGlobeEvent(
  record: LatestAuthRecord,
): Promise<GlobePulseEvent | null> {
  const coords = await coordsForCountry(record.c);
  if (!coords) return null;

  const protocolCode = record.pl?.trim() || record.m?.trim() || "SAT-ID";

  return {
    id: `auth-${record.x}-${record.t}`,
    country: record.c,
    latitude: coords.lat,
    longitude: coords.lon,
    roaming: record.hr === "R",
    authType: "SAT",
    satModule: protocolCode,
    protocolCode,
    homeCountry: record.c,
  };
}
