"use client";

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDeferredReducedMotion } from "@/lib/useDeferredReducedMotion";
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
    <section className="border-b border-keyra-border py-4 last:border-b-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-keyra-text-2">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-keyra-primary">{children}</div>
    </section>
  );
}

function kv(k: string, v: ReactNode) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[13px]">
      <span className="text-keyra-text-2">{k}</span>
      <span className="min-w-0 text-right font-medium text-keyra-primary">{v}</span>
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
  const reduce = useDeferredReducedMotion();
  const kpis = open && country ? buildPublicCountryMapKpis(country) : null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && country ? (
        <>
          <motion.button
            type="button"
            aria-label="Close deployment profile"
            className="fixed inset-0 z-[var(--keyra-z-overlay)] bg-[rgba(15,23,42,0.28)]"
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
            className="fixed inset-y-0 right-0 z-[var(--keyra-z-drawer)] flex w-full max-w-[min(100vw,28rem)] flex-col border-l border-keyra-border bg-keyra-bg shadow-[-20px_0_64px_rgba(15,23,42,0.12)] sm:max-w-md"
            initial={reduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? { x: 0 } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-keyra-border bg-keyra-surface/80 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="text-3xl leading-none" aria-hidden>
                  {flagEmojiFromIso2(country.iso2)}
                </span>
                <div className="min-w-0">
                  <h2 id="deployment-profile-title" className="truncate text-lg font-semibold text-keyra-primary">
                    {country.name}
                  </h2>
                  <p className="mt-1 text-xs text-keyra-text-2">{regionName}</p>
                  <div className="mt-2">
                    <StatusBadge status={country.status} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-bg px-2.5 py-1.5 text-xs font-medium text-keyra-text-2 hover:bg-keyra-surface hover:text-keyra-primary focus-visible:outline-none focus-visible:keyra-focus"
                onClick={onClose}
              >
                Close
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-1 sm:px-5">
              {kpis
                ? section(
                    "Registry-derived signals",
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
                      {kv(
                        "Explicit telemetry fields",
                        kpis.hasExplicitTelemetry ? "Published" : "Sparse — values inferred from registry where noted",
                      )}
                    </>,
                  )
                : null}

              {section(
                "Operational posture",
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
                </>,
              )}

              {section(
                "Protocols & integrations",
                <>
                  {kv("SAT protocol coverage", country.satProtocolCoverage?.trim() || "—")}
                  {kv("SIM / eSIM", country.simEsimStatus?.trim() || "—")}
                  {kv("Government integration", country.govIntegrationStatus?.trim() || "—")}
                  {kv("API status", country.apiStatus?.trim() || "—")}
                  {kv("Connected applications", formatOptionalInt(country.connectedAppsCount))}
                  {kv("Regulatory readiness", country.regulatoryReadiness?.trim() || "—")}
                  {kv("Risk posture", country.riskStatus?.trim() || "—")}
                </>,
              )}

              {section("Connected domains", <p className="break-all font-mono text-xs text-keyra-text-2">{country.countrySubdomain}</p>)}

              {section("Official reference", <OfficialDomainLink href={country.officialReferenceDomain} />)}

              {section(
                "Telco operators",
                <ul className="space-y-3">
                  {country.telcos.map((t) => (
                    <li key={t.id} className="rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-surface/60 px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-keyra-primary">{t.name}</span>
                        <StatusBadge status={t.status} compact />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-keyra-text-2">{t.telcoSubdomain}</p>
                    </li>
                  ))}
                </ul>,
              )}

              {section("Deployment status timeline", <DeploymentStatusTimeline key={country.publicSlug} publicSlug={country.publicSlug} />)}

              {section(
                "Notes & provenance",
                <>
                  {country.statusNote ? (
                    <p className="text-sm text-keyra-text-2">{country.statusNote}</p>
                  ) : (
                    <p className="text-sm text-keyra-text-2">No status note on this record.</p>
                  )}
                  <p className="text-xs text-keyra-text-2">
                    Source: {country.sourceLabel ?? "—"}
                    {country.sourceUrl ? (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={country.sourceUrl}
                          className="text-keyra-accent underline-offset-2 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          link
                        </a>
                      </>
                    ) : null}
                  </p>
                </>,
              )}

              <div className="sticky bottom-0 border-t border-keyra-border bg-keyra-bg/95 pb-1 pt-4 backdrop-blur-sm">
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
