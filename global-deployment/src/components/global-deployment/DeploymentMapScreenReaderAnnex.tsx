"use client";

import { deploymentStatusPresentation } from "@/lib/deployments/status";
import type { DeploymentMapFlatNode } from "@/lib/deployments/deployment-map-utils";
import { WORLD_REGION_PATHS } from "@/lib/deployments/worldRegionPaths";

export function DeploymentMapScreenReaderAnnex({
  visibleNodes,
  selectedMapKey,
  onInspectCountry,
}: {
  visibleNodes: DeploymentMapFlatNode[];
  selectedMapKey: string | null;
  onInspectCountry: (countryId: string) => void;
}) {
  const filterLabel =
    selectedMapKey && WORLD_REGION_PATHS[selectedMapKey]?.label
      ? WORLD_REGION_PATHS[selectedMapKey]!.label
      : "All regions";

  return (
    <section
      aria-label="Deployment map, text navigation"
      className="sr-only"
      tabIndex={-1}
    >
      <h2>Published deployments matching the map filter</h2>
      <p>
        Current region filter: {filterLabel}. {visibleNodes.length} deployment
        {visibleNodes.length === 1 ? "" : "s"} listed.
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        {visibleNodes.map((n) => {
          const st = deploymentStatusPresentation(n.status);
          return (
            <li key={n.id}>
              <button type="button" onClick={() => onInspectCountry(n.id)}>
                {n.name} — {st.label}. {n.regionName}. Open deployment profile.
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
