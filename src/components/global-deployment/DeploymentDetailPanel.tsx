"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { OfficialDomainLink } from "@/components/global-deployment/OfficialDomainLink";
import { StatusBadge } from "@/components/global-deployment/StatusBadge";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import {
  formatBool,
  formatOptionalInt,
  formatOptionalPct,
  formatOptionalTs,
} from "@/lib/deployments/deployment-map-utils";
import type { PublicCountry } from "@/lib/deployments/publicTree";
import { DeploymentStatusTimeline } from "@/components/global-deployment/DeploymentStatusTimeline";
import { buildPublicCountryMapKpis } from "@/lib/deployments/countryMapKpis";

function section(title: string, children: ReactNode) {
  return (
    <section className="border-b border-white/5 py-4 last:border-b-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-200">{children}</div>
    </section>
  );
}

function kv(k: string, v: ReactNode) {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-[13px]">
      <span className="text-slate-400">{k}</span>
      <span className="text-right font-medium text-slate-100">{v}</span>
    </div>
  );
}

export function DeploymentDetailPanel({
  open,
  country,
  regionName,
  onClose,
  onRequestAccess,
}: {
  open: boolean;
  country: PublicCountry | null;
  regionName: string;
  onClose: () => void;
  onRequestAccess: () => void;
}) {
  const reduce = useReducedMotion();
  const kpis = open && country ? buildPublicCountryMapKpis(country) : null;

  return (
    <AnimatePresence>
      {open && country ? (
        <>
          <motion.button
            type="button"
            aria-label="Close deployment profile"
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="deployment-profile-title"
            className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-md flex-col border-l border-white/10 bg-slate-950/92 shadow-[-24px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:rounded-l-2xl"
            initial={reduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? { x: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="text-3xl leading-none" aria-hidden>
                  {flagEmojiFromIso2(country.iso2)}
                </span>
                <div className="min-w-0">
                  <h2 id="deployment-profile-title" className="truncate text-lg font-semibold text-white">
                    {country.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">{regionName}</p>
                  <div className="mt-2">
                    <StatusBadge status={country.status} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                onClick={onClose}
              >
                Close
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
              {kpis
                ? section("Registry-derived signals", (
                    <>
                      {kv("Telco posture", kpis.telcoStatusLine)}
                      {kv("Subscribers (summed)", kpis.subscribersSummedDisplay)}
                      {kv("SAT protocol coverage", kpis.satCoverageDisplay)}
                      {kv("SIM / eSIM", kpis.simEsimDisplay)}
                      {kv("Government integration", kpis.govIntegrationDisplay)}
                      {kv("API status", kpis.apiStatusDisplay)}
                      {kv("Regulatory readiness", kpis.regulatoryDisplay)}
                      {kv("Compliance readiness", kpis.complianceReadinessDisplay)}
                      {kv("Risk posture", kpis.riskDisplay)}
                      {kv("Connected applications (roll-up)", kpis.connectedAppsDisplay)}
                      {kv("Strategic footprint", kpis.strategicPartnersLine)}
                      {kv("Explicit telemetry fields", kpis.hasExplicitTelemetry ? "Published" : "Sparse — values inferred from registry where noted")}
                    </>
                  ))
                : null}

              {section("Operational posture", (
                <>
                  {kv("Deployment stage", country.deploymentStage?.trim() || "—")}
                  {kv("Maturity score", formatOptionalInt(country.deploymentScore))}
                  {kv("Infrastructure health", formatOptionalInt(country.infrastructureHealth))}
                  {kv("Node health", formatOptionalInt(country.nodeHealth))}
                  {kv("Uptime", formatOptionalPct(country.uptimePercentage))}
                  {kv("Last sync", formatOptionalTs(country.lastSyncAt))}
                  {kv("Cluster region", country.clusterRegion?.trim() || "—")}
                  {kv("Auth volume (roll-up)", formatOptionalInt(country.authVolume))}
                  {kv("AI agent enabled", formatBool(country.aiAgentEnabled))}
                </>
              ))}

              {section("Protocols & integrations", (
                <>
                  {kv("SAT protocol coverage", country.satProtocolCoverage?.trim() || "—")}
                  {kv("SIM / eSIM", country.simEsimStatus?.trim() || "—")}
                  {kv("Government integration", country.govIntegrationStatus?.trim() || "—")}
                  {kv("API status", country.apiStatus?.trim() || "—")}
                  {kv("Connected applications", formatOptionalInt(country.connectedAppsCount))}
                  {kv("Regulatory readiness", country.regulatoryReadiness?.trim() || "—")}
                  {kv("Risk posture", country.riskStatus?.trim() || "—")}
                </>
              ))}

              {section("Connected domains", (
                <p className="break-all font-mono text-xs text-slate-300">{country.countrySubdomain}</p>
              ))}

              {section("Official reference", (
                <OfficialDomainLink href={country.officialReferenceDomain} />
              ))}

              {section("Telco operators", (
                <ul className="space-y-3">
                  {country.telcos.map((t) => (
                    <li key={t.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-white">{t.name}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-slate-400">{t.telcoSubdomain}</p>
                    </li>
                  ))}
                </ul>
              ))}

              {section("Deployment status timeline", (
                <DeploymentStatusTimeline key={country.publicSlug} publicSlug={country.publicSlug} />
              ))}

              {section("Notes & provenance", (
                <>
                  {country.statusNote ? <p className="text-sm text-slate-300">{country.statusNote}</p> : <p className="text-sm text-slate-500">No status note on this record.</p>}
                  <p className="text-xs text-slate-500">
                    Source: {country.sourceLabel ?? "—"}
                    {country.sourceUrl ? (
                      <>
                        {" "}
                        ·{" "}
                        <a href={country.sourceUrl} className="text-keyra-accent underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                          link
                        </a>
                      </>
                    ) : null}
                  </p>
                </>
              ))}

              <div className="pt-6">
                <Button type="button" variant="secondary" className="w-full" onClick={onRequestAccess}>
                  Request server access
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
