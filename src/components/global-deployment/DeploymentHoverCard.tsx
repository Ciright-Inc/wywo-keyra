"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { deploymentStatusPresentation } from "@/lib/deployments/status";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import type { ClusteredMapNode } from "@/lib/deployments/deployment-map-utils";
import {
  formatBool,
  formatOptionalInt,
  formatOptionalPct,
  formatOptionalTs,
} from "@/lib/deployments/deployment-map-utils";
import { buildClusterMapKpis, buildPublicCountryMapKpis } from "@/lib/deployments/countryMapKpis";

function row(k: string, v: string) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-1.5 text-[11px] last:border-b-0">
      <span className="shrink-0 text-slate-400">{k}</span>
      <span className="min-w-0 text-right font-medium text-slate-100">{v}</span>
    </div>
  );
}

export function DeploymentHoverCard({
  node,
  clientX,
  clientY,
  visible,
}: {
  node: ClusteredMapNode | null;
  clientX: number;
  clientY: number;
  visible: boolean;
}) {
  const reduce = useReducedMotion();
  if (!node) return null;

  const c = node.country;
  const st = deploymentStatusPresentation(c.status);
  const names =
    node.clusterSize > 1
      ? node.members
          .map((m) => m.name)
          .slice(0, 5)
          .join(" · ") + (node.members.length > 5 ? ` · +${node.members.length - 5}` : "")
      : null;

  const pad = 16;
  const cardW = 320;
  const cardH = 420;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  let left = clientX + pad;
  let top = clientY + pad;
  if (left + cardW > vw - 8) left = clientX - cardW - pad;
  if (top + cardH > vh - 8) top = vh - cardH - 8;
  if (left < 8) left = 8;
  if (top < 8) top = 8;

  const clusterKpis = node.clusterSize > 1 ? buildClusterMapKpis(node.members) : null;
  const countryKpis = node.clusterSize > 1 ? null : buildPublicCountryMapKpis(c);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="tooltip"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="pointer-events-none fixed z-[80] w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-cyan-500/15 bg-slate-950/75 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          style={{ left, top }}
        >
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                {flagEmojiFromIso2(c.iso2)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-white">
                  {node.clusterSize > 1 ? `${node.clusterSize} markets` : c.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{node.regionName}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-200">{st.label}</p>
              </div>
            </div>
            {names ? <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-slate-400">{names}</p> : null}
          </div>
          <div className="max-h-[18rem] overflow-y-auto px-4 py-2">
            {clusterKpis ? (
              <>
                {row("Cluster", clusterKpis.summaryLine)}
                {row("Operators (summed)", formatOptionalInt(clusterKpis.operatorCount))}
              </>
            ) : countryKpis ? (
              <>
                {row("Operators (registry)", formatOptionalInt(countryKpis.operatorCount))}
                {row("Telco posture", countryKpis.telcoStatusLine)}
                {row("Subscribers (sum)", countryKpis.subscribersSummedDisplay)}
                {row("Auth events (roll-up)", countryKpis.authEventsDisplay)}
                {row("SAT protocol coverage", countryKpis.satCoverageDisplay)}
                {row("SIM / eSIM", countryKpis.simEsimDisplay)}
                {row("Government integration", countryKpis.govIntegrationDisplay)}
                {row("API status", countryKpis.apiStatusDisplay)}
                {row("Last sync", formatOptionalTs(c.lastSyncAt))}
                {row("Server cluster", c.clusterRegion?.trim() || "—")}
                {row("Maturity score", formatOptionalInt(c.deploymentScore))}
                {row("Connected applications", countryKpis.connectedAppsDisplay)}
                {row("Regulatory readiness", countryKpis.regulatoryDisplay)}
                {row("Compliance readiness", countryKpis.complianceReadinessDisplay)}
                {row("Risk posture", countryKpis.riskDisplay)}
                {row("AI agent", formatBool(c.aiAgentEnabled))}
                {row("Infrastructure uptime", formatOptionalPct(c.uptimePercentage))}
                {row("Node health", formatOptionalInt(c.nodeHealth))}
                {row("Infra health", formatOptionalInt(c.infrastructureHealth))}
                {row("Deployment stage", c.deploymentStage?.trim() || "—")}
                {row("Partners / operators", countryKpis.strategicPartnersLine)}
              </>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
