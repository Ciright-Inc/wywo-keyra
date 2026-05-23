import type { GlobePulse, GlobePulseLink } from "@/lib/globe/types";

export function createRoamingHomeLink(pulse: GlobePulse): GlobePulseLink {
  return {
    id: `link-home-${pulse.id}`,
    isRoamingHome: true,
    fromId: pulse.id,
    toId: null,
    fromLat: pulse.lat,
    fromLon: pulse.lon,
    toLat: pulse.homeLat!,
    toLon: pulse.homeLon!,
    homeDistanceDeg: pulse.homeDistanceDeg,
    color: pulse.color || "#9ec9ff",
    startedAt: pulse.startedAt,
  };
}

export function syncPulseLinks(pulses: GlobePulse[], existingLinks: GlobePulseLink[] = []): GlobePulseLink[] {
  const existingById = new Map(existingLinks.map((link) => [link.id, link]));
  const links: GlobePulseLink[] = [];

  for (const pulse of pulses) {
    if (!pulse.awayFromHome) continue;
    if (typeof pulse.homeLat !== "number" || typeof pulse.homeLon !== "number") continue;

    const link = createRoamingHomeLink(pulse);
    const prev = existingById.get(link.id);
    links.push(prev ? { ...link, startedAt: prev.startedAt } : link);
  }

  return links;
}
