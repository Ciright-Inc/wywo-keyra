"use client";

import { useMemo, useState } from "react";
import { WORLD_MAP_VIEWBOX, WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";

export function WorldRegionMap({
  mapKeys,
  selectedMapKey,
  onSelectMapKey,
}: {
  mapKeys: string[];
  selectedMapKey: string | null;
  onSelectMapKey: (mapKey: string | null) => void;
}) {
  const keys = useMemo(() => {
    const allowed = new Set(mapKeys);
    return Object.keys(WORLD_REGION_PATHS).filter((k) => allowed.has(k));
  }, [mapKeys]);

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-[var(--keyra-surface)]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-keyra-border bg-keyra-bg/70 px-3 py-1 text-xs text-keyra-text-2 backdrop-blur">
        {hovered ? WORLD_REGION_PATHS[hovered]?.label ?? hovered : "Hover or focus a region"}
      </div>

      <svg
        viewBox={WORLD_MAP_VIEWBOX}
        className="block h-auto w-full"
        role="img"
        aria-label="World regions map"
      >
        <defs>
          <linearGradient id="keyraMapFill" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="rgba(102,227,255,0.10)" />
            <stop offset="1" stopColor="rgba(108,124,255,0.08)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="960" height="480" fill="rgba(255,255,255,0.02)" />

        {keys.map((key) => {
          const meta = WORLD_REGION_PATHS[key];
          if (!meta) return null;
          const active = selectedMapKey === key;
          const isHover = hovered === key;
          return (
            <path
              key={key}
              d={meta.d}
              tabIndex={0}
              role="button"
              aria-pressed={active}
              aria-label={meta.label}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
              onFocus={() => setHovered(key)}
              onBlur={() => setHovered((h) => (h === key ? null : h))}
              onClick={() => onSelectMapKey(active ? null : key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectMapKey(active ? null : key);
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  onSelectMapKey(null);
                }
              }}
              fill={
                active
                  ? "rgba(102,227,255,0.18)"
                  : isHover
                    ? "rgba(102,227,255,0.12)"
                    : "url(#keyraMapFill)"
              }
              stroke={
                active
                  ? "rgba(102,227,255,0.55)"
                  : isHover
                    ? "rgba(102,227,255,0.35)"
                    : "rgba(255,255,255,0.12)"
              }
              strokeWidth={active ? 2.25 : 1.5}
              className="cursor-pointer outline-none transition focus-visible:stroke-[rgba(102,227,255,0.75)]"
            />
          );
        })}
      </svg>
    </div>
  );
}
