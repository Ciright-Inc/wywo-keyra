import Link from "next/link";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import {
  AGENT_DOMAIN_LAYERS,
  labelForIndustry,
  labelForWorldType,
} from "@/lib/agents/agentWorldConstants";
import { getAgentWorldControlCenterMetrics } from "@/lib/agents/agentWorldQueries";
import { adminBody, adminEyebrow, adminPanelStatic, adminSectionTitle } from "@/lib/admin/adminUiClasses";

export default async function AdminAgentsControlCenterPage() {
  const metrics = await getAgentWorldControlCenterMetrics();

  const kpis = [
    { label: "Active worlds", value: metrics.activeWorlds, href: "/admin/agents/worlds" },
    { label: "Active agents", value: metrics.activeInstances, href: "/admin/agents/inheritance" },
    { label: "Parent designs", value: metrics.parentAgents, href: "/admin/agents/parent-agents" },
    { label: "Bridge agents", value: metrics.keyraAgents, href: "/admin/agents/deployment-bridge" },
    { label: "Knowledge packs", value: metrics.knowledgePacks, href: "/admin/agents/knowledge-packs" },
    { label: "Graph edges", value: metrics.graphEdges, href: "/admin/agents/operational-graph" },
    { label: "Index entries", value: metrics.indexEntries, href: "/admin/agents/operational-graph" },
    { label: "Pending approvals", value: metrics.pendingApprovals, href: "/admin/agents/deployment-bridge" },
  ];

  return (
    <div className="space-y-8">
      <section className="ds-feature-card is-dashboard">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="ds-caption-uppercase">Global Agent World Architecture</p>
            <h1 className="ds-display-sm mt-2">Operational control center</h1>
            <p className={`${adminBody} mt-3 max-w-2xl text-[var(--ds-body)]`}>
              Operational civilization infrastructure for the autonomous era. Governed digital workers
              performing trusted operational execution across sovereign environments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/agents/worlds" className="ds-btn-primary is-sm">
              View worlds
            </Link>
            <Link href="/admin/agents/operational-graph" className="ds-btn-secondary is-sm">
              Operational graph
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="ds-feature-card is-dashboard block no-underline">
            <p className="ds-caption-uppercase">{kpi.label}</p>
            <p className="ds-kpi-value mt-2">{kpi.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className={adminPanelStatic}>
          <p className={adminEyebrow}>Domain layers</p>
          <h2 className={`${adminSectionTitle} mt-2`}>Sovereign operational graph</h2>
          <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>
            Authenticated machine-to-machine operational infrastructure for governments, enterprises, and
            nations. Operational data never leaves the tenant world — only lineage and orchestration
            inheritance flow upstream.
          </p>

          <div className="mt-5 space-y-3">
            {AGENT_DOMAIN_LAYERS.map((layer) => (
              <div
                key={layer.value}
                className="flex items-center justify-between gap-3 rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] px-4 py-3"
              >
                <div>
                  <p className="ds-body-sm font-semibold text-[var(--ds-ink)]">{layer.label}</p>
                  <p className="ds-caption mt-0.5 font-mono text-[var(--ds-body)]">{layer.host}</p>
                </div>
                <span className="ds-badge-pill normal-case tracking-normal">Layer</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${adminPanelStatic} bg-[var(--ds-canvas-soft)]`}>
          <p className={adminEyebrow}>World types</p>
          <h2 className={`${adminSectionTitle} mt-2`}>Active classifications</h2>
          <ul className="mt-4 space-y-2">
            {metrics.worldsByType.map((row) => (
              <li
                key={row.worldType}
                className="flex items-center justify-between ds-body-sm text-[var(--ds-ink)]"
              >
                <span>{labelForWorldType(row.worldType)}</span>
                <span className="font-[family-name:var(--font-accent)] text-[13px]">{row._count._all}</span>
              </li>
            ))}
          </ul>

          <p className={`${adminEyebrow} mt-6`}>By industry</p>
          <ul className="mt-3 space-y-2">
            {metrics.agentsByIndustry.map((row) => (
              <li
                key={row.industryVertical}
                className="flex items-center justify-between ds-body-sm text-[var(--ds-ink)]"
              >
                <span>{labelForIndustry(row.industryVertical)}</span>
                <span className="font-[family-name:var(--font-accent)] text-[13px]">{row._count._all}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={adminPanelStatic}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={adminSectionTitle}>Recent deployment events</h2>
            <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
              Governance traceability across Ciright parent, Keyra bridge, and marketplace layers.
            </p>
          </div>
          <code className="ds-badge-pill font-mono normal-case tracking-normal">/api/admin/agents/*</code>
        </div>

        <div className="ds-table-wrap mt-5">
          <div className="ds-table-scroll">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Layer</th>
                  <th>Entity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-[var(--ds-body)]">
                      No deployment events recorded yet.
                    </td>
                  </tr>
                ) : (
                  metrics.recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{event.eventType}</td>
                      <td className="font-mono text-[13px]">{event.domainLayer}</td>
                      <td className="font-mono text-[13px]">{event.entityId}</td>
                      <td>{event.status ? <AgentStatusBadge status={event.status} /> : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
