import Link from "next/link";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { labelForIndustry } from "@/lib/agents/agentWorldConstants";
import { listParentAgentsWithKeyraCount } from "@/lib/agents/agentWorldQueries";
import {
  adminBody,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export default async function ParentAgentsPage() {
  const parentAgents = await listParentAgentsWithKeyraCount();

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Ciright parent layer</p>
            <span className="block mt-1">Parent agents</span>
          </>
        }
        description="Parent agent designs, workflow definitions, orchestration logic, and inheritance models. No tenant transactional data."
        actions={
          <Link href="/admin/agents/deployment-bridge" className="ds-btn-secondary is-sm">
            Deployment bridge
          </Link>
        }
      />

      {parentAgents.length === 0 ? (
        <AdminListEmptyState
          variant="panel"
          entityName="parent agents"
          emptyMessage="Seed the agent world catalog or create parent agent designs in Ciright."
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Parent agent ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Industry</th>
                  <th className="is-numeric">Bridge agents</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {parentAgents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="font-mono text-[13px]">{agent.parentAgentId}</td>
                    <td>
                      <p className="font-semibold text-[var(--ds-ink)]">{agent.name}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)] line-clamp-1`}>
                        {agent.description}
                      </p>
                    </td>
                    <td>{agent.operationalCategory}</td>
                    <td>{labelForIndustry(agent.industryVertical)}</td>
                    <td className="is-numeric">{agent._count.keyraAgents}</td>
                    <td>{agent.isPublished ? "Yes" : "No"}</td>
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
