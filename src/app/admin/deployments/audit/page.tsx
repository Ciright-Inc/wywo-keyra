import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";

export default async function AdminAuditPage() {
  await assertAdminServer();
  const [audit, history] = await Promise.all([
    prisma.auditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.statusHistory.findMany({ orderBy: { changedAt: "desc" }, take: 120 }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Audit</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Immutable-style audit trail and status transitions.</p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-keyra-text-2">Audit events</h2>
      <div className="mt-3 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {audit.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{a.createdAt.toISOString()}</td>
                <td className="px-3 py-3 text-keyra-primary">{a.action}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {a.entityType} · {a.entityId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-keyra-text-2">Status history</h2>
      <div className="mt-3 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {history.map((h) => (
              <tr key={h.id}>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{h.changedAt.toISOString()}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {h.targetType} · {h.targetId}
                </td>
                <td className="px-3 py-3 text-keyra-text-2">
                  {h.previousStatus ?? "—"} → {h.nextStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
