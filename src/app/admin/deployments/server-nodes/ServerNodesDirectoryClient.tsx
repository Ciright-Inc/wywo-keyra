"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteServerNodeMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { useToast } from "@/components/ui/Toast";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";
import {
  adminBody,
  adminCheckbox,
  adminCountBadge,
  adminEyebrow,
  adminLabel,
  adminLegacyInput,
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminTextareaMono,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

export type ServerNodeRow = {
  id: string;
  fqdn: string;
  environment: string;
  targetType: string;
  targetId: string;
  status: string;
};

type SelectOption = { id: string; label: string };

type Props = {
  nodes: ServerNodeRow[];
  pagination: TablePaginationMeta;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  searchQuery: string;
  countryOptions: SelectOption[];
  telcoOptions: SelectOption[];
  showCreate: boolean;
  /** Mirrors the server-side mutate check — gates the trash icon. */
  canDelete: boolean;
  /** Server action bound from the parent Server Component */
  createServerNode: (formData: FormData) => Promise<void>;
};

const BASE_HREF = "/admin/deployments/server-nodes";

export function ServerNodesDirectoryClient({
  nodes,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  countryOptions,
  telcoOptions,
  showCreate,
  canDelete,
  createServerNode,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useAdminConfirm();
  const toast = useToast();
  const { page, pageSize, totalCount } = pagination;

  /** Delete a server node via the server route. Auth/audit/revalidate happen server-side. */
  async function handleDelete(id: string, label: string) {
    if (!(await confirm(deleteServerNodeMessage(label)))) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/server-nodes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      showAdminActionToast(toast, "deleted", "server-node", { name: label });
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    adminLegacyInput;
  const selectClass = adminLegacyInput;

  const buildSearchHref = useCallback(
    (query: string) => buildListHref(BASE_HREF, { page: 1, pageSize, searchQuery: query }, defaultPageSize),
    [pageSize, defaultPageSize],
  );

  const buildPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildListHref(
        BASE_HREF,
        { page: nextPage, pageSize: nextPageSize, searchQuery },
        defaultPageSize,
      ),
    [searchQuery, defaultPageSize],
  );

  const canUseCreate = showCreate && (countryOptions.length > 0 || telcoOptions.length > 0);

  return (
    <div>
      <div className={adminPanel}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={adminPageTitle}>Server nodes</h1>
              <span className={adminCountBadge}>
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              FQDN targets for country or telco assets you are allowed to see.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="FQDN, healthcheck, target id…"
              ariaLabel="Search server nodes"
            />
            {canUseCreate ? (
              <button
                type="button"
                className={createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create server node"}
              </button>
            ) : null}
          </div>
        </div>

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New server node</h2>
            <form action={createServerNode} className="ds-form-grid ds-form-grid--2 mt-4">
              <label className={`${adminLabel} sm:col-span-2`}>
                Target type
                <select name="targetType" required className={selectClass}>
                  <option value="COUNTRY">COUNTRY</option>
                  <option value="TELCO">TELCO</option>
                </select>
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Target (country)
                <select name="targetIdCountry" className={selectClass}>
                  <option value="">—</option>
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-keyra-text-2 sm:col-span-2">
                For COUNTRY targets, pick the country above. For TELCO, pick a telco below (only one target applies).
              </p>
              <label className={`${adminLabel} sm:col-span-2`}>
                Target (telco)
                <select name="targetIdTelco" className={selectClass}>
                  <option value="">—</option>
                  {telcoOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                FQDN
                <input name="fqdn" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Environment
                <select name="environment" required className={selectClass}>
                  <option value="PROD">PROD</option>
                  <option value="STAGE">STAGE</option>
                  <option value="TEST">TEST</option>
                </select>
              </label>
              <label className={adminLabel}>
                Status
                <select name="status" className={selectClass}>
                  <option value="IDENTIFIED">IDENTIFIED</option>
                  <option value="INSTITUTIONAL_AWARENESS">INSTITUTIONAL_AWARENESS</option>
                  <option value="TVIP">TVIP</option>
                  <option value="OPERATIONAL">OPERATIONAL</option>
                </select>
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Healthcheck URL
                <input name="healthcheckUrl" className={inputClass} />
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Metadata JSON (optional)
                <textarea name="metadataJson" rows={3} className={adminTextareaMono} />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {deleteError ? (
        <p className="mt-3 ds-admin-error-banner">
          {deleteError}
        </p>
      ) : null}

      <div className="ds-table-wrap mt-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                <th className="px-3 py-2">FQDN</th>
                <th className="px-3 py-2">Env</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Status</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodes.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={5}
                  hasSearch={hasSearch}
                  entityName="server nodes"
                />
              ) : (
                nodes.map((n) => {
                  const isDeleting = deletingId === n.id;
                  return (
                    <tr key={n.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>{n.fqdn}</td>
                      <td className="is-muted">{n.environment}</td>
                      <td className="max-w-[18rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {n.targetType} · {n.targetId}
                      </td>
                      <td className="px-3 py-2">
                        <span className="ds-status-pill">
                          {n.status}
                        </span>
                      </td>
                      <td className="is-actions">
                        <RowActions
                          editHref={`/admin/deployments/server-nodes/${n.id}`}
                          editAriaLabel={`Edit ${n.fqdn}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete ${n.fqdn}`}
                          onDelete={() => void handleDelete(n.id, n.fqdn)}
                          isDeleting={isDeleting}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          {...pagination}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          buildHref={buildPaginationHref}
        />
      </div>
    </div>
  );
}