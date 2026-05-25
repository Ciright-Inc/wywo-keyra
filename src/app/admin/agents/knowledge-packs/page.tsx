import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { labelForIndustry } from "@/lib/agents/agentWorldConstants";
import { listKnowledgePacksWithCounts } from "@/lib/agents/agentWorldQueries";
import {
  adminBody,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export default async function KnowledgePacksPage() {
  const knowledgePacks = await listKnowledgePacksWithCounts();

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Modular intelligence</p>
            <span className="block mt-1">Knowledge packs</span>
          </>
        }
        description="Approved knowledge, workflows, prompt structures, operational rules, integration mappings, and compliance guidance."
      />

      {knowledgePacks.length === 0 ? (
        <AdminListEmptyState
          title="No knowledge packs"
          description="Create modular intelligence packs attachable to agent worlds and deployment agents."
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Pack ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Industry</th>
                  <th>Country</th>
                  <th className="is-numeric">Worlds</th>
                  <th className="is-numeric">Agents</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {knowledgePacks.map((pack) => (
                  <tr key={pack.id}>
                    <td className="font-mono text-[13px]">{pack.packId}</td>
                    <td>
                      <p className="font-semibold text-[var(--ds-ink)]">{pack.name}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)] line-clamp-1`}>
                        {pack.description}
                      </p>
                    </td>
                    <td>{pack.packCategory}</td>
                    <td>{pack.industryVertical ? labelForIndustry(pack.industryVertical) : "—"}</td>
                    <td>{pack.countryIso2 ?? "Global"}</td>
                    <td className="is-numeric">{pack._count.worldLinks}</td>
                    <td className="is-numeric">{pack._count.keyraAgentLinks}</td>
                    <td>{pack.isPublished ? "Yes" : "No"}</td>
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
