import Link from "next/link";
import type { IntrinsicIndexEntityKind } from "@prisma/client";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import {
  INTRINSIC_INDEX_ENTITY_KINDS,
  labelForEntityKind,
  labelForGraphRelation,
} from "@/lib/agents/agentWorldConstants";
import { getOperationalGraphSummary } from "@/lib/agents/intrinsicIndex";
import {
  adminBody,
  adminPanelStatic,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

const GRAPH_SCOPE_KINDS = [
  "PERSON",
  "IDENTITY",
  "DEVICE",
  "SIM",
  "SUBSCRIBER",
  "AGENT",
  "TASK",
  "ORGANIZATION",
  "TENANT_WORLD",
  "COUNTRY",
  "REGULATORY_BOUNDARY",
] as const;

export default async function OperationalGraphPage() {
  const graph = await getOperationalGraphSummary();

  const entityCounts = graph.nodes.reduce<Record<string, number>>((acc, node) => {
    acc[node.entityKind] = (acc[node.entityKind] ?? 0) + 1;
    return acc;
  }, {});

  const nodeMap = new Map(graph.nodes.map((n) => [`${n.entityKind}:${n.entityRef}`, n]));

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Intrinsic indexing system</p>
            <span className="block mt-1">Operational graph</span>
          </>
        }
        description="Civilization-scale operational relationship graph. Person ↔ Identity ↔ Device ↔ SIM ↔ Subscriber ↔ Agent ↔ Task ↔ Organization ↔ Tenant World ↔ Country ↔ Regulatory Boundary."
        actions={
          <Link href="/admin/agents/inheritance" className="ds-btn-secondary is-sm">
            Tenant instances
          </Link>
        }
      />

      <div className={`${adminPanelStatic} bg-[var(--ds-canvas-soft)]`}>
        <p className="ds-caption-uppercase">Graph scope</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {GRAPH_SCOPE_KINDS.map((kind, index) => {
            const label =
              INTRINSIC_INDEX_ENTITY_KINDS.find((k) => k.value === kind)?.label ??
              kind.replace(/_/g, " ");
            return (
              <span key={kind} className="inline-flex items-center gap-2">
                {index > 0 ? (
                  <span className="hidden text-[var(--ds-muted)] sm:inline" aria-hidden>
                    ↔
                  </span>
                ) : null}
                <span className="ds-badge-pill normal-case tracking-normal">{label}</span>
              </span>
            );
          })}
        </div>
        <p className={`${adminBody} mt-4 text-[var(--ds-body)]`}>
          {graph.indexCount.toLocaleString()} index entries · {graph.edges.length.toLocaleString()}{" "}
          graph edges · lineage only — no tenant operational data upstream
        </p>
        {Object.keys(entityCounts).length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(entityCounts).map(([kind, count]) => (
              <span key={kind} className="ds-badge-pill normal-case tracking-normal">
                {labelForEntityKind(kind as IntrinsicIndexEntityKind)} · {count}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {graph.edges.length === 0 ? (
        <AdminListEmptyState
          variant="panel"
          entityName="graph edges"
          emptyMessage={
            graph.indexCount > 0
              ? `${graph.indexCount} entities are indexed. Operational edges appear as relationships are governed across sovereign boundaries.`
              : "Index governed entities and operational relationships as agent worlds deploy."
          }
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>From</th>
                  <th>From kind</th>
                  <th>To</th>
                  <th>To kind</th>
                  <th>Lineage</th>
                </tr>
              </thead>
              <tbody>
                {graph.edges.map((edge) => {
                  const fromNode = nodeMap.get(`${edge.fromKind}:${edge.fromRef}`);
                  const toNode = nodeMap.get(`${edge.toKind}:${edge.toRef}`);
                  return (
                    <tr key={edge.id}>
                      <td className="font-semibold text-[var(--ds-ink)]">
                        {labelForGraphRelation(edge.relation)}
                      </td>
                      <td>
                        <p className="font-semibold text-[var(--ds-ink)]">
                          {fromNode?.displayLabel ?? edge.fromRef}
                        </p>
                        <p className={`${adminBody} mt-0.5 font-mono text-[13px] text-[var(--ds-body)]`}>
                          {edge.fromRef}
                        </p>
                      </td>
                      <td>{labelForEntityKind(edge.fromKind)}</td>
                      <td>
                        <p className="font-semibold text-[var(--ds-ink)]">
                          {toNode?.displayLabel ?? edge.toRef}
                        </p>
                        <p className={`${adminBody} mt-0.5 font-mono text-[13px] text-[var(--ds-body)]`}>
                          {edge.toRef}
                        </p>
                      </td>
                      <td>{labelForEntityKind(edge.toKind)}</td>
                      <td>{edge.lineageOnly ? "Lineage only" : "Operational"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
