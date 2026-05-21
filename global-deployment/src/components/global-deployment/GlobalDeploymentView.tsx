"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DeploymentMapSection } from "@/components/global-deployment/DeploymentMapSection";
import { RegionLegend } from "@/components/global-deployment/RegionLegend";
import { DeploymentRegistry } from "@/components/global-deployment/DeploymentRegistry";
import { EmptyState } from "@/components/global-deployment/EmptyState";
import { ServerAccessRequestDialog } from "@/components/global-deployment/ServerAccessRequestDialog";
import { DeploymentDetailPanel } from "@/components/global-deployment/DeploymentDetailPanel";
import type { PublicCountry, PublicDeploymentTree } from "@/lib/deployments/publicTree";
import { useDeploymentMapData } from "@/components/global-deployment/useDeploymentMapData";

export function GlobalDeploymentView({ initialTree }: { initialTree: PublicDeploymentTree }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMapKey, setSelectedMapKey] = useState<string | null>(null);
  const [expandedCountryId, setExpandedCountryId] = useState<string | null>(null);
  const [inspectCountryId, setInspectCountryId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { targetType: "COUNTRY" | "TELCO"; targetId: string; title: string }>(
    null,
  );

  useEffect(() => {
    if (inspectCountryId) {
      setExpandedCountryId(inspectCountryId);
    }
  }, [inspectCountryId]);

  const mapData = useDeploymentMapData({ initialTree, selectedMapKey });

  let inspected: { country: PublicCountry; regionName: string } | null = null;
  if (inspectCountryId) {
    for (const r of mapData.tree.regions) {
      const c = r.countries.find((x) => x.id === inspectCountryId);
      if (c) {
        inspected = { country: c, regionName: r.name };
        break;
      }
    }
  }

  useEffect(() => {
    const rid = searchParams.get("rid");
    const code = searchParams.get("code");
    if (!rid || !code) return;

    (async () => {
      const res = await fetch("/api/public/access-requests/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: rid, token: code }),
      });
      const json: unknown = await res.json().catch(() => null);
      const msg =
        typeof json === "object" &&
        json !== null &&
        "message" in json &&
        typeof (json as { message?: unknown }).message === "string"
          ? (json as { message: string }).message
          : res.ok
            ? "Verified."
            : "Unable to verify.";
      window.alert(msg);
      router.replace("/");
    })();
  }, [router, searchParams]);

  const hasRows = mapData.filteredTree.regions.some((r) => r.countries.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <DeploymentMapSection
        mapData={mapData}
        selectedMapKey={selectedMapKey}
        onSelectMapKey={setSelectedMapKey}
        onCountryInspect={setInspectCountryId}
        inspectCountryId={inspectCountryId}
      />

      <div id="registry" className="mt-10 scroll-mt-24 lg:mt-12">
        {!hasRows ? (
          <EmptyState title="No published deployments" body="Check back soon." />
        ) : (
          <DeploymentRegistry
            regions={mapData.filteredTree.regions}
            expandedCountryId={expandedCountryId}
            onToggleCountry={(id) => setExpandedCountryId((cur) => (cur === id ? null : id))}
            onInspectCountry={setInspectCountryId}
            onRequestCountryAccess={(country) =>
              setDialog({
                targetType: "COUNTRY",
                targetId: country.id,
                title: `${country.name} — country access`,
              })
            }
            onRequestTelcoAccess={(country, telco) =>
              setDialog({
                targetType: "TELCO",
                targetId: telco.id,
                title: `${telco.name} — telco access`,
              })
            }
          />
        )}
      </div>

      <div className="mt-8 lg:mt-10">
        <RegionLegend />
      </div>

      <DeploymentDetailPanel
        open={Boolean(inspected)}
        country={inspected?.country ?? null}
        regionName={inspected?.regionName ?? ""}
        onClose={() => {
          setInspectCountryId(null);
        }}
        onRequestAccess={() => {
          if (!inspected) return;
          setDialog({
            targetType: "COUNTRY",
            targetId: inspected.country.id,
            title: `${inspected.country.name} — country access`,
          });
        }}
      />

      <ServerAccessRequestDialog
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        targetType={dialog?.targetType ?? "COUNTRY"}
        targetId={dialog?.targetId ?? ""}
        title={dialog?.title ?? ""}
      />
    </div>
  );
}
