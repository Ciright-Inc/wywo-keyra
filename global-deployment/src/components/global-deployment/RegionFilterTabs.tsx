"use client";

import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";
import { useMemo } from "react";
import { cn } from "@/components/ui/cn";

export function RegionFilterTabs({
  mapKeys,
  selectedMapKey,
  onSelectMapKey,
  className,
}: {
  mapKeys: string[];
  selectedMapKey: string | null;
  onSelectMapKey: (mapKey: string | null) => void;
  className?: string;
}) {
  const keys = useMemo(() => {
    const allowed = new Set(mapKeys);
    return Object.keys(WORLD_REGION_PATHS).filter((k) => allowed.has(k));
  }, [mapKeys]);

  const pill = (active: boolean) =>
    cn(
      "rounded-[var(--keyra-radius-md)] border px-2.5 py-1.5 text-[11px] font-medium leading-none transition focus-visible:outline-none focus-visible:keyra-focus",
      active
        ? "border-black/20 bg-keyra-primary text-white shadow-sm"
        : "border-keyra-border bg-keyra-bg text-keyra-text-2 hover:border-black/15 hover:text-keyra-primary",
    );

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="tablist" aria-label="Filter deployment map by region">
      <button
        type="button"
        role="tab"
        aria-selected={selectedMapKey === null}
        className={pill(selectedMapKey === null)}
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
            role="tab"
            aria-selected={active}
            className={pill(active)}
            onClick={() => onSelectMapKey(active ? null : k)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
