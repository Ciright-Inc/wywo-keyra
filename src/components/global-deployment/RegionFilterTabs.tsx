"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useMemo } from "react";
import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";

export function RegionFilterTabs({
  mapKeys,
  selectedMapKey,
  onSelectMapKey,
  layoutGroupId = "deployment-region-filters",
}: {
  mapKeys: string[];
  selectedMapKey: string | null;
  onSelectMapKey: (mapKey: string | null) => void;
  /** Unique when multiple filter bars exist in the DOM (e.g. mobile + desktop). */
  layoutGroupId?: string;
}) {
  const keys = useMemo(() => {
    const allowed = new Set(mapKeys);
    return Object.keys(WORLD_REGION_PATHS).filter((k) => allowed.has(k));
  }, [mapKeys]);

  return (
    <LayoutGroup id={layoutGroupId}>
      <div className="flex flex-wrap gap-2">
        <motion.button
          layout
          type="button"
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:keyra-focus ${
            selectedMapKey === null
              ? "border-[var(--keyra-action-border)] bg-[var(--keyra-action)] text-keyra-primary"
              : "border-keyra-border bg-transparent text-keyra-text-2 hover:text-keyra-primary"
          }`}
          onClick={() => onSelectMapKey(null)}
        >
          All regions
        </motion.button>
        {keys.map((k) => {
          const label = WORLD_REGION_PATHS[k]?.label ?? k;
          const active = selectedMapKey === k;
          return (
            <motion.button
              layout
              key={k}
              type="button"
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:keyra-focus ${
                active
                  ? "border-[var(--keyra-action-border)] bg-[var(--keyra-action)] text-keyra-primary"
                  : "border-keyra-border bg-transparent text-keyra-text-2 hover:text-keyra-primary"
              }`}
              onClick={() => onSelectMapKey(active ? null : k)}
            >
              {label}
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
