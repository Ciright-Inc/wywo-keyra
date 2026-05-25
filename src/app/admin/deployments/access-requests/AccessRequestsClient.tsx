"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import {
  adminCheckbox,
  adminCountBadge,
  adminEyebrow,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

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
      <AdminDirectoryPageHeader
        title="Access requests"
        badge={
          rows ? (
            <span className={adminCountBadge}>
              {hasSearch ? `${visibleCount} of ${totalCount}` : totalCount}
            </span>
          ) : null
        }
        description="Approve or reject after email verification."
        search={
          <CollapsibleSearchBar
            mode="client"
            searchQuery={query}
            onChange={setQuery}
            placeholder="Email, target id, status…"
            ariaLabel="Search access requests"
          />
        }
        actions={
          <Button type="button" variant="secondary" disabled={loading} onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {error ? <p className="ds-admin-error-banner mt-4">{error}</p> : null}

      {isInitialLoading ? (
        <div className="mt-8">
          <AdminDirectorySkeleton tab="deployments-access-requests" tableOnly rows={6} />
        </div>
      ) : (
      <div className={`${adminTableWrap} mt-8 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableScroll}>
        <table className={`${adminTable} min-w-[36rem]`}>
          <thead>
            <tr>
              <th>Created</th>
              <th>Email</th>
              <th>Target</th>
              <th>Verify</th>
              <th>Approval</th>
              <th className="is-right">Actions</th>
            </tr>
          </thead>
          <tbody>
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
                <td className="is-muted ds-numeric">{r.createdAt}</td>
                <td>{r.workEmail}</td>
                <td className="is-muted">
                  {r.targetType} · {r.targetId}
                </td>
                <td className="is-muted">{r.verificationStatus}</td>
                <td className="is-muted">{r.approvalStatus}</td>
                <td className="is-actions">
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
      </div>
      )}
    </div>
  );
}