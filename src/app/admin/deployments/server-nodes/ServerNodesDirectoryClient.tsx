"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { RowActions } from "@/components/admin/RowActions";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";

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
  const { page, pageSize, totalCount } = pagination;

  /** Delete a server node via the server route. Auth/audit/revalidate happen server-side. */
  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete server node "${label}"? This cannot be undone.`)) return;
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
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "mt-1 h-10 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary shadow-sm outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60";
  const selectClass = `${inputClass} bg-keyra-bg`;

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
      <div className="ds-panel is-dashboard">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Server nodes</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
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
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
                  createOpen
                    ? "border border-[var(--keyra-action-border)] bg-keyra-bg text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                    : "bg-[var(--keyra-action)] text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                }`}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create server node"}
              </button>
            ) : null}
          </div>
        </div>

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-keyra-border pt-5">
            <h2 className="text-lg font-semibold text-keyra-primary">New server node</h2>
            <form action={createServerNode} className="keyra-card mt-4 grid gap-3 p-5 sm:grid-cols-2">
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Target type
                <select name="targetType" required className={selectClass}>
                  <option value="COUNTRY">COUNTRY</option>
                  <option value="TELCO">TELCO</option>
                </select>
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
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
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
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
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                FQDN
                <input name="fqdn" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Environment
                <select name="environment" required className={selectClass}>
                  <option value="PROD">PROD</option>
                  <option value="STAGE">STAGE</option>
                  <option value="TEST">TEST</option>
                </select>
              </label>
              <label className="text-sm text-keyra-text-2">
                Status
                <select name="status" className={selectClass}>
                  <option value="IDENTIFIED">IDENTIFIED</option>
                  <option value="INSTITUTIONAL_AWARENESS">INSTITUTIONAL_AWARENESS</option>
                  <option value="TVIP">TVIP</option>
                  <option value="OPERATIONAL">OPERATIONAL</option>
                </select>
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Healthcheck URL
                <input name="healthcheckUrl" className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Metadata JSON (optional)
                <textarea
                  name="metadataJson"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 py-2 font-mono text-xs text-keyra-primary shadow-sm outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus"
                />
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
                <th className="w-px whitespace-nowrap px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-keyra-text-2">
                    {hasSearch
                      ? "No server nodes match your search. Try different keywords or clear the search."
                      : "No server nodes visible to your account."}
                  </td>
                </tr>
              ) : (
                nodes.map((n) => {
                  const isDeleting = deletingId === n.id;
                  return (
                    <tr key={n.id} className={`transition hover:bg-keyra-surface ${isDeleting ? "opacity-60" : ""}`}>
                      <td className="px-3 py-2 font-medium text-keyra-primary">{n.fqdn}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{n.environment}</td>
                      <td className="max-w-[18rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {n.targetType} · {n.targetId}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-xs font-medium text-keyra-primary">
                          {n.status}
                        </span>
                      </td>
                      <td className="w-px whitespace-nowrap px-2 py-2 text-right">
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
