"use client";

import { useMemo } from "react";
import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";

export function RegionFilterTabs({
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

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:keyra-focus ${
          selectedMapKey === null
            ? "border-[rgba(102,227,255,0.55)] bg-[rgba(102,227,255,0.12)] text-keyra-primary"
            : "border-keyra-border bg-transparent text-keyra-text-2 hover:text-keyra-primary"
        }`}
        onClick={() => onSelectMapKey(null)}
      >
        All regions
      </button>
      {keys.map((k) => {
        const label = WORLD_REGION_PATHS[k]?.label ?? k;
        const active = selectedMapKey === k;
        return (
          <button
            key={k}
            type="button"
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:keyra-focus ${
              active
                ? "border-[rgba(102,227,255,0.55)] bg-[rgba(102,227,255,0.12)] text-keyra-primary"
                : "border-keyra-border bg-transparent text-keyra-text-2 hover:text-keyra-primary"
            }`}
            onClick={() => onSelectMapKey(active ? null : k)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
