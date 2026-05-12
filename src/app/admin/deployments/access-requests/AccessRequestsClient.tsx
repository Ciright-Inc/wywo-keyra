"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { Button } from "@/components/ui/Button";

type Row = {
  id: string;
  workEmail: string;
  targetType: string;
  targetId: string;
  verificationStatus: string;
  approvalStatus: string;
  createdAt: string;
};

export function AccessRequestsClient() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    startTransition(() => {
      setError(null);
    });
    const res = await fetch("/api/admin/deployments/access-requests", { credentials: "include" });
    if (!res.ok) {
      startTransition(() => {
        setError("Unable to load requests.");
      });
      return;
    }
    const json = (await res.json()) as { requests: Row[] };
    startTransition(() => {
      setRows(json.requests);
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Access requests</h1>
          <p className="mt-2 text-sm text-keyra-text-2">Approve or reject after email verification.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Verify</th>
              <th className="px-3 py-2">Approval</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{r.createdAt}</td>
                <td className="px-3 py-3 text-keyra-primary">{r.workEmail}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {r.targetType} · {r.targetId}
                </td>
                <td className="px-3 py-3 text-keyra-text-2">{r.verificationStatus}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.approvalStatus}</td>
                <td className="px-3 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3 text-xs"
                      disabled={r.approvalStatus !== "PENDING" || r.verificationStatus !== "VERIFIED"}
                      onClick={async () => {
                        const res = await fetch(`/api/admin/deployments/access-requests/${r.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ approvalStatus: "APPROVED" }),
                        });
                        if (!res.ok) window.alert("Unable to approve.");
                        await load();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 px-3 text-xs"
                      disabled={r.approvalStatus !== "PENDING"}
                      onClick={async () => {
                        const reason = window.prompt("Rejection reason (internal record):") ?? "";
                        if (!reason.trim()) return;
                        const res = await fetch(`/api/admin/deployments/access-requests/${r.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ approvalStatus: "REJECTED", rejectionReason: reason.trim() }),
                        });
                        if (!res.ok) window.alert("Unable to reject.");
                        await load();
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
