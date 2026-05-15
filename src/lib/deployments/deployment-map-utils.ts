import type { DeploymentStatus } from "@prisma/client";
import { WORLD_ISO2_LATLNG, WORLD_MAP_VIEWBOX_WIRE } from "@/lib/deployments/worldWireframePaths.generated";
import type { PublicCountry, PublicRegion } from "@/lib/deployments/publicTree";

export const MAP_W = 1000;
export const MAP_H = 500;

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

export type MapNodeStatusVisual = {
  core: string;
  ring: string;
  glow: string;
  pulse: string;
};

/** Calm enterprise palette for map nodes (distinct from marketing badges). */
export function mapStatusVisual(status: DeploymentStatus): MapNodeStatusVisual {
  switch (status) {
    case "OPERATIONAL":
      return {
        core: "rgba(52,211,153,0.92)",
        ring: "rgba(52,211,153,0.35)",
        glow: "rgba(16,185,129,0.45)",
        pulse: "rgba(52,211,153,0.25)",
      };
    case "TVIP":
      return {
        core: "rgba(56,189,248,0.95)",
        ring: "rgba(56,189,248,0.38)",
        glow: "rgba(14,165,233,0.42)",
        pulse: "rgba(56,189,248,0.22)",
      };
    case "INSTITUTIONAL_AWARENESS":
      return {
        core: "rgba(251,191,36,0.95)",
        ring: "rgba(251,191,36,0.4)",
        glow: "rgba(245,158,11,0.38)",
        pulse: "rgba(251,191,36,0.2)",
      };
    case "IDENTIFIED":
      return {
        core: "rgba(248,113,113,0.9)",
        ring: "rgba(248,113,113,0.42)",
        glow: "rgba(239,68,68,0.4)",
        pulse: "rgba(248,113,113,0.18)",
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
