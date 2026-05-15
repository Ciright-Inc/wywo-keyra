"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlobalDeploymentMap } from "@/components/global-deployment/GlobalDeploymentMap";
import { RegionFilterTabs } from "@/components/global-deployment/RegionFilterTabs";
import { RegionLegend } from "@/components/global-deployment/RegionLegend";
import { StatusBadge } from "@/components/global-deployment/StatusBadge";
import { OfficialDomainLink } from "@/components/global-deployment/OfficialDomainLink";
import { EmptyState } from "@/components/global-deployment/EmptyState";
import { ServerAccessRequestDialog } from "@/components/global-deployment/ServerAccessRequestDialog";
import { DeploymentDetailPanel } from "@/components/global-deployment/DeploymentDetailPanel";
import { DeploymentMapScreenReaderAnnex } from "@/components/global-deployment/DeploymentMapScreenReaderAnnex";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import type { PublicCountry, PublicDeploymentTree } from "@/lib/deployments/publicTree";
import { useDeploymentMapData } from "@/components/global-deployment/useDeploymentMapData";

function formatPopulation(display: string | null | undefined, population: number | null | undefined) {
  if (display && display.trim().length) return display;
  if (population === null || population === undefined) return "—";
  return population.toLocaleString("en-IE");
}

function formatSubscribers(display: string | null | undefined, subscribers: number | null | undefined) {
  if (display && display.trim().length) return display;
  if (subscribers === null || subscribers === undefined) return "—";
  return subscribers.toLocaleString("en-IE");
}

export function GlobalDeploymentView({ initialTree }: { initialTree: PublicDeploymentTree }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMapKey, setSelectedMapKey] = useState<string | null>(null);
  const [expandedCountryId, setExpandedCountryId] = useState<string | null>(null);
  const [inspectCountryId, setInspectCountryId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { targetType: "COUNTRY" | "TELCO"; targetId: string; title: string }>(
    null,
  );

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
      router.replace("/global-deployment");
    })();
  }, [router, searchParams]);

  const hasRows = mapData.filteredTree.regions.some((r) => r.countries.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-4 lg:hidden">
        <RegionFilterTabs
          mapKeys={mapData.tree.mapKeys}
          selectedMapKey={selectedMapKey}
          onSelectMapKey={setSelectedMapKey}
          layoutGroupId="deployment-region-filters-mobile"
        />
      </div>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="space-y-4 lg:order-1">
          <GlobalDeploymentMap
            mapData={mapData}
            selectedMapKey={selectedMapKey}
            onSelectMapKey={setSelectedMapKey}
            onCountryInspect={setInspectCountryId}
            inspectCountryId={inspectCountryId}
          />
          <DeploymentMapScreenReaderAnnex
            visibleNodes={mapData.visibleNodes}
            selectedMapKey={selectedMapKey}
            onInspectCountry={setInspectCountryId}
          />
          <RegionLegend />
        </div>

        <div className="hidden space-y-4 lg:order-2 lg:block">
          <RegionFilterTabs
            mapKeys={mapData.tree.mapKeys}
            selectedMapKey={selectedMapKey}
            onSelectMapKey={setSelectedMapKey}
            layoutGroupId="deployment-region-filters-desktop"
          />
        </div>
      </div>

      <div className="mt-10 space-y-4 lg:mt-12">
        {!hasRows ? (
          <EmptyState title="No published deployments" body="Check back soon." />
        ) : (
          mapData.filteredTree.regions.map((region) => (
            <section
              key={region.id}
              className="rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-[var(--keyra-surface)]"
            >
              <header className="border-b border-keyra-border px-4 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">
                  UN M49 · {region.continentCode} / {region.subregionCode}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-keyra-primary">{region.name}</h2>
              </header>

              <div className="divide-y divide-keyra-border">
                {region.countries.map((country) => {
                  const open = expandedCountryId === country.id;
                  return (
                    <div key={country.id} className="px-4 py-4 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          aria-label={`Registry row: ${country.name}`}
                          className="flex w-full items-start gap-3 text-left focus-visible:outline-none focus-visible:keyra-focus sm:items-center"
                          aria-expanded={open}
                          onClick={() => setExpandedCountryId(open ? null : country.id)}
                        >
                          <span className="text-2xl leading-none" aria-hidden>
                            {flagEmojiFromIso2(country.iso2)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-semibold text-keyra-primary">{country.name}</span>
                            <span className="mt-1 block text-sm text-keyra-text-2">
                              Population: {formatPopulation(country.populationDisplay, country.population)}
                            </span>
                            <span className="mt-1 block text-xs text-keyra-text-2">{country.countrySubdomain}</span>
                          </span>
                        </button>

                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <StatusBadge status={country.status} />
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="ghost" className="h-10 px-3 text-xs" onClick={() => setInspectCountryId(country.id)}>
                              Map profile
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() =>
                                setDialog({
                                  targetType: "COUNTRY",
                                  targetId: country.id,
                                  title: `${country.name} — country access`,
                                })
                              }
                            >
                              Request Server Access
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-keyra-text-2">
                        <span className="text-xs uppercase tracking-wider text-keyra-text-2">Official reference</span>
                        <OfficialDomainLink href={country.officialReferenceDomain} />
                      </div>

                      {open ? (
                        <div className="mt-5 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
                          <table className="w-full min-w-[32rem] text-left text-sm">
                            <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
                              <tr>
                                <th className="px-3 py-2">Telco</th>
                                <th className="px-3 py-2">Subscribers</th>
                                <th className="px-3 py-2">Subdomain</th>
                                <th className="px-3 py-2">Official</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Access</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-keyra-border">
                              {country.telcos.map((t) => (
                                <tr key={t.id} className="align-top">
                                  <td className="px-3 py-3 font-medium text-keyra-primary">{t.name}</td>
                                  <td className="px-3 py-3 text-keyra-text-2">
                                    {formatSubscribers(t.subscribersDisplay, t.subscribers)}
                                  </td>
                                  <td className="px-3 py-3 text-xs text-keyra-text-2">{t.telcoSubdomain}</td>
                                  <td className="px-3 py-3">
                                    <OfficialDomainLink href={t.officialDomain} />
                                  </td>
                                  <td className="px-3 py-3">
                                    <StatusBadge status={t.status} />
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-10 px-3 text-xs"
                                      onClick={() =>
                                        setDialog({
                                          targetType: "TELCO",
                                          targetId: t.id,
                                          title: `${t.name} — telco access`,
                                        })
                                      }
                                    >
                                      Request Server Access
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <DeploymentDetailPanel
        open={Boolean(inspected)}
        country={inspected?.country ?? null}
        regionName={inspected?.regionName ?? ""}
        onClose={() => setInspectCountryId(null)}
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
