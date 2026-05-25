import { AgentStatusBadge } from "@/components/agents/AgentStatusBadge";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { labelForWorldType } from "@/lib/agents/agentWorldConstants";
import { listTenantInstancesWithLineage } from "@/lib/agents/agentWorldQueries";
import {
  adminBody,
  adminPanelStatic,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export default async function InheritancePage() {
  const instances = await listTenantInstancesWithLineage();

  return (
    <div className="space-y-6">
      <AdminDirectoryPageHeader
        title={
          <>
            <p className="ds-caption-uppercase">Agent inheritance model</p>
            <span className="block mt-1">Tenant agent instances</span>
          </>
        }
        description="Three-layer inheritance: Ciright Parent → Keyra Deployment → Tenant Instance. Operational data stays inside the sovereign tenant world."
      />

      <div className={`${adminPanelStatic} bg-[var(--ds-canvas-soft)]`}>
        <p className="ds-caption-uppercase">Inheritance chain</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="ds-badge-pill normal-case tracking-normal">Ciright Parent</span>
          <span className="hidden text-[var(--ds-muted)] sm:inline" aria-hidden>
            →
          </span>
          <span className="ds-badge-pill normal-case tracking-normal">Keyra Deployment</span>
          <span className="hidden text-[var(--ds-muted)] sm:inline" aria-hidden>
            →
          </span>
          <span className="ds-badge-pill normal-case tracking-normal">Tenant Instance</span>
        </div>
      </div>

      {instances.length === 0 ? (
        <AdminListEmptyState
          variant="panel"
          entityName="tenant instances"
          emptyMessage="Tenant Agent Instance IDs are generated when customers activate operational deployments."
        />
      ) : (
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Instance ID</th>
                  <th>Display name</th>
                  <th>World</th>
                  <th>Keyra agent</th>
                  <th>Parent agent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((instance) => (
                  <tr key={instance.id}>
                    <td className="font-mono text-[13px]">{instance.instanceId}</td>
                    <td className="font-semibold text-[var(--ds-ink)]">{instance.displayName}</td>
                    <td>
                      <p>{instance.agentWorld.name}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {labelForWorldType(instance.agentWorld.worldType)}
                      </p>
                    </td>
                    <td>
                      <p className="font-mono text-[13px]">{instance.keyraAgent.keyraAgentId}</p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {instance.keyraAgent.name}
                      </p>
                    </td>
                    <td>
                      <p className="font-mono text-[13px]">
                        {instance.keyraAgent.parentAgent.parentAgentId}
                      </p>
                      <p className={`${adminBody} mt-0.5 text-[var(--ds-body)]`}>
                        {instance.keyraAgent.parentAgent.name}
                      </p>
                    </td>
                    <td>
                      <AgentStatusBadge status={instance.status} />
                    </td>
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
