import type { DeploymentStatus } from "@prisma/client";
import { WORLD_ISO2_LATLNG, WORLD_MAP_VIEWBOX_WIRE } from "@/lib/deployments/worldWireframePaths.generated";
import type { PublicCountry, PublicRegion } from "@/lib/deployments/publicTree";

export const MAP_W = 1000;
export const MAP_H = 500;

/** Natural cartographic palette (ocean + land), not monochrome wireframe. */
export const MAP_TEXTURE_URL = "/world-satellite.jpg";

export const MAP_SURFACE = {
  oceanDeep: "#061018",
  regionFill: "rgba(255,214,120,0.14)",
  regionStroke: "rgba(255,220,140,0.62)",
  dimOverlay: "rgba(5,10,22,0.62)",
  arc: "rgba(236,248,255,0.72)",
  arcGlow: "rgba(180,220,255,0.35)",
} as const;
export function parseMapViewBox(): { w: number; h: number } {
  const m = /^0\s+0\s+([\d.]+)\s+([\d.]+)$/.exec(WORLD_MAP_VIEWBOX_WIRE);
  if (m) return { w: Number(m[1]), h: Number(m[2]) };
  return { w: MAP_W, h: MAP_H };
}

export function latLngToMapXY(lat: number, lng: number): { x: number; y: number } {
  const { w, h } = parseMapViewBox();
  return {
    x: ((lng + 180) / 360) * w,
    y: ((90 - lat) / 180) * h,
  };
}
export function mapCountryDimOverlay(iso2: string, dimmedIsoKeys: Set<string> | null): string | null {
  if (!dimmedIsoKeys || dimmedIsoKeys.has(iso2)) return null;
  return MAP_SURFACE.dimOverlay;
}

export function deploymentArcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const lift = Math.min(56, dist * 0.28);
  const cx = mx - (dy / dist) * lift * 0.25;
  const cy = my - lift;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function deploymentNetworkArcs(
  nodes: DeploymentMapFlatNode[],
  max = 48,
): Array<{ d: string; key: string }> {
  const out: Array<{ d: string; key: string }> = [];
  const thresh = 140;
  outer: for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      if (a.mapKey !== b.mapKey) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy > thresh * thresh) continue;
      out.push({
        key: `${a.id}-${b.id}`,
        d: deploymentArcPath(a.x, a.y, b.x, b.y),
      });
      if (out.length >= max) break outer;
    }
  }
  return out;
}

export type MapNodeStatusVisual = {
  core: string;
  ring: string;
  glow: string;
  pulse: string;
};

/** Solid map-pin palette — readable on satellite imagery. */
export function mapStatusVisual(status: DeploymentStatus): MapNodeStatusVisual {
  switch (status) {
    case "OPERATIONAL":
      return {
        core: "#22c58a",
        ring: "#34d399",
        glow: "rgba(34,197,138,0.45)",
        pulse: "rgba(52,211,153,0.55)",
      };
    case "TVIP":
      return {
        core: "#38bdf8",
        ring: "#7dd3fc",
        glow: "rgba(56,189,248,0.45)",
        pulse: "rgba(125,211,252,0.55)",
      };
    case "INSTITUTIONAL_AWARENESS":
      return {
        core: "#fbbf24",
        ring: "#fcd34d",
        glow: "rgba(251,191,36,0.45)",
        pulse: "rgba(252,211,77,0.55)",
      };
    case "IDENTIFIED":
      return {
        core: "#f87171",
        ring: "#fca5a5",
        glow: "rgba(248,113,113,0.45)",
        pulse: "rgba(252,165,165,0.55)",
      };
    default: {
      const _e: never = status;
      return _e;
    }
  }
}

export type DeploymentMapFlatNode = {
  id: string;
  iso2: string;
  name: string;
  status: DeploymentStatus;
  mapKey: string;
  regionName: string;
  regionId: string;
  x: number;
  y: number;
  country: PublicCountry;
};

export function flattenPublishedCountries(regions: PublicRegion[]): DeploymentMapFlatNode[] {
  const out: DeploymentMapFlatNode[] = [];
  for (const r of regions) {
    for (const c of r.countries) {
      const iso = c.iso2.trim().toUpperCase();
      let x: number;
      let y: number;
      if (c.latitude != null && c.longitude != null) {
        const p = latLngToMapXY(c.latitude, c.longitude);
        x = p.x + (c.visualOffsetX ?? 0);
        y = p.y + (c.visualOffsetY ?? 0);
      } else {
        const ll = WORLD_ISO2_LATLNG[iso];
        if (!ll) continue;
        const p = latLngToMapXY(ll[0], ll[1]);
        x = p.x + (c.visualOffsetX ?? 0);
        y = p.y + (c.visualOffsetY ?? 0);
      }
      out.push({
        id: c.id,
        iso2: iso,
        name: c.name,
        status: c.status,
        mapKey: r.mapKey,
        regionName: r.name,
        regionId: r.id,
        x,
        y,
        country: c,
      });
    }
  }
  return out;
}

export type ClusteredMapNode = DeploymentMapFlatNode & {
  clusterSize: number;
  members: DeploymentMapFlatNode[];
};

export function clusterNodes(nodes: DeploymentMapFlatNode[], zoom: number): ClusteredMapNode[] {
  if (nodes.length === 0) return [];
  const cell = Math.min(96, Math.max(22, 52 / Math.max(0.45, zoom)));
  const buckets = new Map<string, DeploymentMapFlatNode[]>();
  for (const n of nodes) {
    const gx = Math.floor(n.x / cell);
    const gy = Math.floor(n.y / cell);
    const key = `${gx}:${gy}`;
    const arr = buckets.get(key) ?? [];
    arr.push(n);
    buckets.set(key, arr);
  }
  const merged: ClusteredMapNode[] = [];
  for (const group of buckets.values()) {
    if (group.length === 1) {
      const n = group[0]!;
      merged.push({ ...n, clusterSize: 1, members: [n] });
      continue;
    }
    let sx = 0;
    let sy = 0;
    for (const n of group) {
      sx += n.x;
      sy += n.y;
    }
    const cx = sx / group.length;
    const cy = sy / group.length;
    const lead = group.reduce((a, b) => (a.country.sortOrder <= b.country.sortOrder ? a : b));
    merged.push({
      ...lead,
      x: cx,
      y: cy,
      clusterSize: group.length,
      members: group,
    });
  }
  return merged;
}

export function formatOptionalInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-IE");
}

export function formatOptionalPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${n.toFixed(1)}%`;
}

export function formatOptionalTs(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-IE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatBool(b: boolean | null | undefined): string {
  if (b === null || b === undefined) return "—";
  return b ? "Yes" : "No";
}
