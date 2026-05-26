import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoPhoneFilterField } from "@/components/wywo/WywoPhoneFilterField";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import {
  adminPanel,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";
import { assertWywoAdminActor } from "@/lib/wywo/auth";
import { listAuditLogs } from "@/lib/wywo/audit";

type Search = {
  messageId?: string;
  actorPhone?: string;
  action?: string;
};

export default async function WywoAuditPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await assertWywoAdminActor("/wywo/admin/audit");
  const sp = await searchParams;
  const rows = await listAuditLogs({
    messageId: sp.messageId,
    actorPhone: sp.actorPhone,
    action: sp.action,
    limit: 200,
  });
  return (
    <div>
      <AdminDirectoryPageHeader
        title="Audit log"
        description="Every state transition on every WYWO message. Append-only and attributable."
      />
      <form method="get" className="mt-4 flex flex-wrap gap-3 items-end">
        <label>
          <span className="ds-caption-uppercase">Message id</span>
          <input className="ds-text-input is-sm" name="messageId" defaultValue={sp.messageId ?? ""} />
        </label>
        <label className="min-w-[280px]">
          <span className="ds-caption-uppercase">Actor phone</span>
          <WywoPhoneFilterField
            name="actorPhone"
            defaultValue={sp.actorPhone ?? ""}
            placeholder="87 555 0100"
          />
        </label>
        <label>
          <span className="ds-caption-uppercase">Action</span>
          <input className="ds-text-input is-sm" name="action" defaultValue={sp.action ?? ""} placeholder="message.created" />
        </label>
        <button type="submit" className="ds-btn-primary is-sm">Filter</button>
      </form>

      <div className={`${adminPanel} mt-6 p-0 overflow-hidden`}>
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Message</th>
                  <th>Old → New</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="ds-body-sm p-6">
                      No audit entries match this filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td className="ds-caption">{formatAdminDateTime(r.createdAt)}</td>
                      <td>
                        <span className="ds-caption-uppercase">{r.action}</span>
                      </td>
                      <td className="ds-caption ds-numeric">{r.actorPhone ?? r.actorUid ?? "—"}</td>
                      <td className="ds-caption ds-numeric break-all">{r.messageId ?? "—"}</td>
                      <td className="ds-caption">
                        {r.oldValueJson ? (
                          <code className="block max-w-[260px] truncate">
                            {JSON.stringify(r.oldValueJson)}
                          </code>
                        ) : null}
                        {r.newValueJson ? (
                          <code className="block max-w-[260px] truncate text-[var(--ds-ink)]">
                            {JSON.stringify(r.newValueJson)}
                          </code>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
