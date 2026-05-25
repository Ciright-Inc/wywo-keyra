import Link from "next/link";
import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { labelForIndustry, labelForWorldType } from "@/lib/agents/agentWorldConstants";
import { listAgentWorldsWithCounts } from "@/lib/agents/agentWorldQueries";
import {
  adminBody,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export default async function AgentWorldsPage() {
  const worlds = await listAgentWorldsWithCounts();

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Sovereign marketplace</p>
            <span className="block mt-1">Agent worlds</span>
          </>
        }
        description="Sovereign operational environments containing agents, permissions, knowledge packs, integrations, and governance structures."
        actions={
          <Link href="/admin/agents/inheritance" className="ds-btn-secondary is-sm">
            Tenant instances
          </Link>
        }
      />

      {worlds.length === 0 ? (
        <AdminListEmptyState
          variant="panel"
          entityName="agent worlds"
          emptyMessage="Customers deploy sovereign agent worlds after subscribing to marketplace agents."
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>World ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th className="is-numeric">Agents</th>
                  <th className="is-numeric">Packs</th>
                </tr>
              </thead>
              <tbody>
                {worlds.map((world) => (
                  <tr key={world.id}>
                    <td className="font-mono text-[13px]">{world.worldId}</td>
                    <td>
                      <p className="font-semibold text-[var(--ds-ink)]">{world.name}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {labelForIndustry(world.industryVertical)}
                        {world.countryIso2 ? ` · ${world.countryIso2}` : ""}
                      </p>
                    </td>
                    <td>{labelForWorldType(world.worldType)}</td>
                    <td>{world.organizationName ?? "—"}</td>
                    <td>{world.sovereignRegion ?? "—"}</td>
                    <td>
                      <AgentStatusBadge status={world.status} />
                    </td>
                    <td className="is-numeric">{world._count.tenantInstances}</td>
                    <td className="is-numeric">{world._count.knowledgePackLinks}</td>
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
