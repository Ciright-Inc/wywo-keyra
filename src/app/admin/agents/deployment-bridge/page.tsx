import Link from "next/link";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { labelForIndustry } from "@/lib/agents/agentWorldConstants";
import { listKeyraAgentsWithRelations } from "@/lib/agents/agentWorldQueries";
import {
  adminBody,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export default async function DeploymentBridgePage() {
  const keyraAgents = await listKeyraAgentsWithRelations();

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Keyra deployment bridge</p>
            <span className="block mt-1">Deployment bridge agents</span>
          </>
        }
        description="Keyra deployment catalog at ciright.agents.keyra.ie — mappings to Ciright parent agents, classifications, and marketplace readiness."
        actions={
          <Link href="/admin/agents/parent-agents" className="ds-btn-secondary is-sm">
            Parent agents
          </Link>
        }
      />

      {keyraAgents.length === 0 ? (
        <AdminListEmptyState
          variant="panel"
          entityName="deployment bridge agents"
          emptyMessage="Create Keyra deployment agents linked to Ciright parent designs."
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Keyra agent ID</th>
                  <th>Name</th>
                  <th>Parent agent</th>
                  <th>Industry</th>
                  <th>Classification</th>
                  <th>Readiness</th>
                  <th className="is-numeric">Instances</th>
                </tr>
              </thead>
              <tbody>
                {keyraAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="font-mono text-[13px]">{agent.keyraAgentId}</td>
                    <td>
                      <p className="font-semibold text-[var(--ds-ink)]">{agent.name}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {agent.subscriptionPackage ?? "—"}
                      </p>
                    </td>
                    <td>
                      <p className="font-mono text-[13px]">{agent.parentAgent.parentAgentId}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {agent.parentAgent.name}
                      </p>
                    </td>
                    <td>{labelForIndustry(agent.industryVertical)}</td>
                    <td>{agent.deploymentClassification ?? "—"}</td>
                    <td>
                      <AgentStatusBadge status={agent.deploymentReadiness} />
                    </td>
                    <td className="is-numeric">{agent._count.tenantInstances}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
