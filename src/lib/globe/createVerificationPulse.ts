import { getProtocolColor } from "@/lib/globe/protocolColors";
import { randomLandCoordinates } from "@/lib/globe/landDetection";
import type { GlobePulse, GlobePulseEvent } from "@/lib/globe/types";

export function createVerificationPulse(
  event: GlobePulseEvent,
  {
    globalRandom = false,
    useSignInCoords = false,
    jitter = false,
    landMask = null,
  }: {
    globalRandom?: boolean;
    useSignInCoords?: boolean;
    jitter?: boolean;
    landMask?: ImageData | null;
  } = {},
): GlobePulse | null {
  if (!event) return null;

  let lat: number;
  let lon: number;

  if (useSignInCoords) {
    lat = event.latitude ?? event.sourceLat ?? NaN;
    lon = event.longitude ?? event.sourceLng ?? event.sourceLon ?? NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      ({ lat, lon } = randomLandCoordinates(landMask));
    }
  } else if (globalRandom) {
    ({ lat, lon } = randomLandCoordinates(landMask));
  } else {
    lat = event.latitude ?? event.sourceLat ?? NaN;
    lon = event.longitude ?? event.sourceLng ?? event.sourceLon ?? NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    if (jitter) {
      lat += (Math.random() - 0.5) * 16;
      lon += (Math.random() - 0.5) * 28;
      lat = Math.max(-85, Math.min(85, lat));
      lon = ((lon + 180) % 360) - 180;
    }
  }

  return {
    id: `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    city: event.city,
    lat,
    lon,
    color: getProtocolColor(event),
    startedAt: performance.now(),
  };
}
