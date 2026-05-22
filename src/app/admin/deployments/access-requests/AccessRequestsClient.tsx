"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";

type Row = {
  id: string;
  workEmail: string;
  targetType: string;
  targetId: string;
  verificationStatus: string;
  approvalStatus: string;
  createdAt: string;
};

export function AccessRequestsClient({ initialRequests }: { initialRequests?: Row[] }) {
  const skipInitialFetch = useRef(initialRequests != null);
  const confirm = useAdminConfirm();
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(initialRequests ?? null);
  const [loading, setLoading] = useState(initialRequests == null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    startTransition(() => {
      setError(null);
    });
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  /** Case-insensitive substring filter across the visible columns. */
  const filteredRows = useMemo(() => {
    if (!rows) return null;
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.workEmail, r.targetType, r.targetId, r.verificationStatus, r.approvalStatus].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      ),
    );
  }, [rows, query]);
  const hasSearch = query.trim().length > 0;
  const visibleCount = filteredRows?.length ?? 0;
  const totalCount = rows?.length ?? 0;
  const isInitialLoading = loading && rows === null;
  const isRefreshing = loading && rows !== null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">
            Access requests
            {rows ? (
              <span className="ml-2 rounded-full border border-keyra-border bg-keyra-surface px-2.5 py-0.5 align-middle text-xs font-medium text-keyra-text-2">
                {hasSearch ? `${visibleCount} of ${totalCount}` : totalCount}
              </span>
            ) : null}
          </h1>
          <p className="mt-2 text-sm text-keyra-text-2">Approve or reject after email verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <CollapsibleSearchBar
            mode="client"
            searchQuery={query}
            onChange={setQuery}
            placeholder="Email, target id, status…"
            ariaLabel="Search access requests"
          />
          <Button type="button" variant="secondary" disabled={loading} onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {isInitialLoading ? (
        <div className="mt-8">
          <AdminDirectorySkeleton tab="deployments-access-requests" tableOnly rows={6} />
        </div>
      ) : (
      <div className={`mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`}>
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
            {(filteredRows ?? []).length === 0 ? (
              <AdminListEmptyState
                variant="table-row"
                colSpan={6}
                hasSearch={hasSearch}
                entityName="access requests"
              />
            ) : null}
            {(filteredRows ?? []).map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 text-xs text-keyra-text-2">{r.createdAt}</td>
                <td className="px-3 py-3 text-keyra-primary">{r.workEmail}</td>
                <td className="px-3 py-3 text-xs text-keyra-text-2">
                  {r.targetType} · {r.targetId}
                </td>
                <td className="px-3 py-3 text-keyra-text-2">{r.verificationStatus}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.approvalStatus}</td>
                <td className="px-3 py-3 text-right">
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3 text-xs"
                      disabled={r.approvalStatus !== "PENDING" || r.verificationStatus !== "VERIFIED"}
                      onClick={async () => {
                        if (
                          !(await confirm({
                            message: `Approve access request for "${r.workEmail}"?`,
                            confirmLabel: "Approve",
                          }))
                        ) {
                          return;
                        }
                        const res = await fetch(`/api/admin/deployments/access-requests/${r.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ approvalStatus: "APPROVED" }),
                        });
                        if (!res.ok) {
                          toast.error("Unable to approve", "The access request could not be approved.");
                          return;
                        }
                        showAdminActionToast(toast, "approved", "access-request", { name: r.workEmail });
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
                        if (
                          !(await confirm({
                            message: `Reject access request for "${r.workEmail}"?`,
                            confirmLabel: "Reject",
                          }))
                        ) {
                          return;
                        }
                        const reason = window.prompt("Rejection reason (internal record):") ?? "";
                        if (!reason.trim()) return;
                        const res = await fetch(`/api/admin/deployments/access-requests/${r.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ approvalStatus: "REJECTED", rejectionReason: reason.trim() }),
                        });
                        if (!res.ok) {
                          toast.error("Unable to reject", "The access request could not be rejected.");
                          return;
                        }
                        showAdminActionToast(toast, "rejected", "access-request", { name: r.workEmail });
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
      )}
    </div>
  );
}
