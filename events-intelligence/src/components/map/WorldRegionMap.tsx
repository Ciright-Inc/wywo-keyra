"use client";

import Link from "next/link";
import type { GeopoliticalRegion } from "@prisma/client";
import { REGION_LABELS, REGION_ORDER, REGION_SLUGS } from "@/lib/constants";

/** Percentage positions — navigational “global map”, not cartographic truth. */
const HOTSPOTS: Record<GeopoliticalRegion, { l: number; t: number; w: number; h: number }> = {
  NORTH_AMERICA: { l: 8, t: 26, w: 24, h: 28 },
  WESTERN_EUROPE: { l: 42, t: 24, w: 14, h: 18 },
  EASTERN_EUROPE_BALKANS_CAUCASUS: { l: 52, t: 26, w: 16, h: 18 },
  MIDDLE_EAST_GCC: { l: 54, t: 38, w: 14, h: 16 },
  SOUTH_ASIA: { l: 62, t: 40, w: 14, h: 18 },
  SOUTHEAST_ASIA: { l: 72, t: 44, w: 14, h: 16 },
  EAST_ASIA: { l: 78, t: 30, w: 16, h: 20 },
  LATIN_AMERICA: { l: 22, t: 54, w: 16, h: 26 },
  CARIBBEAN: { l: 24, t: 42, w: 12, h: 12 },
  AFRICA: { l: 46, t: 48, w: 18, h: 26 },
  OCEANIA: { l: 82, t: 62, w: 14, h: 14 },
};

export function WorldRegionMap() {
  return (
    <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)]">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-[var(--line)]"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <ellipse
          cx="400"
          cy="210"
          rx="320"
          ry="160"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.45"
        />
        <path
          d="M120 180 Q260 120 400 150 T680 170 Q620 240 520 260 Q360 280 200 240 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
      </svg>

      {REGION_ORDER.map((key) => {
        const slug = REGION_SLUGS[key];
        const label = REGION_LABELS[key];
        const { l, t, w, h } = HOTSPOTS[key];
        return (
          <Link
            key={key}
            href={`/regions/${slug}`}
            title={label}
            className="absolute flex items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--elevated)]/85 px-1 text-center text-[10px] font-medium leading-tight text-[var(--fg)] shadow-sm backdrop-blur-sm transition hover:z-10 hover:border-[var(--fg)] hover:bg-[var(--elevated)] md:text-[11px]"
            style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
          >
            <span className="px-1">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
