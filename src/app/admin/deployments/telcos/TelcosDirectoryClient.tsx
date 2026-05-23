"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteTelcoMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { useToast } from "@/components/ui/Toast";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { buildListHref } from "@/lib/admin/listSearchParams";
import { useAdminRouteTransition } from "@/lib/admin/useAdminRouteTransition";
import {
  adminBody,
  adminCheckbox,
  adminFormCheckboxLabelWide,
  adminCountBadge,
  adminEyebrow,
  adminLabel,
  adminLegacyInput,
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;
const TELCOS_BASE_HREF = "/admin/deployments/telcos";

export type TelcoSortKey = "name" | "country" | "subdomain" | "status" | "published" | "created";

type CountryOption = { id: string; name: string; iso2: string };

export type TelcoRow = {
  id: string;
  name: string;
  telcoSubdomain: string;
  status: string;
  isPublished: boolean;
  country: { name: string; iso2: string };
};

export type TelcoPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
};

function buildTelcosListHref(
  page: number,
  pageSize: number,
  defaultPageSize: number,
  searchQuery: string,
  sortBy: TelcoSortKey,
  sortDir: "asc" | "desc",
): string {
  return buildListHref(
    TELCOS_BASE_HREF,
    { page, pageSize, searchQuery },
    defaultPageSize,
    sortBy === "created" && sortDir === "desc"
      ? undefined
      : { sort: sortBy === "created" ? undefined : sortBy, dir: sortDir },
  );
}

function nextSortState(
  column: TelcoSortKey,
  sortBy: TelcoSortKey,
  sortDir: "asc" | "desc",
): { sort: TelcoSortKey; dir: "asc" | "desc" } {
  if (sortBy === column) return { sort: column, dir: sortDir === "asc" ? "desc" : "asc" };
  return { sort: column, dir: "asc" };
}

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const neighbors = new Set<number>();
  for (let d = -2; d <= 2; d += 1) {
    const p = current + d;
    if (p >= 1 && p <= total) neighbors.add(p);
  }
  neighbors.add(1);
  neighbors.add(total);
  const sorted = Array.from(neighbors).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    if (i > 0 && sorted[i - 1] !== undefined && p - sorted[i - 1]! > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

type Props = {
  telcos: TelcoRow[];
  pagination: TelcoPagination;
  pageSizeOptions: readonly number[];
  /** Must match server default so omitting `perPage` in URLs stays consistent */
  defaultPageSize: number;
  /** URL `q` param; server trims and caps length */
  searchQuery: string;
  sortBy: TelcoSortKey;
  sortDir: "asc" | "desc";
  countries: CountryOption[];
  showCreate: boolean;
  /** Mirrors the server-side `canMutate` check — gates per-row delete buttons. */
  canDelete: boolean;
  /** Server action bound from the parent Server Component */
  createTelco: (formData: FormData) => Promise<void>;
};

export function TelcosDirectoryClient({
  telcos,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  sortBy,
  sortDir,
  countries,
  showCreate,
  canDelete,
  createTelco,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useAdminConfirm();
  const toast = useToast();
  const { isPending, navigate } = useAdminRouteTransition();
  const { page, pageSize, totalCount, totalPages, showingFrom, showingTo } = pagination;
  const canUseCreate = showCreate && countries.length > 0;

  /** Hard-delete via the new `DELETE /api/admin/deployments/telcos/[id]` route. The server
   * route enforces the same `canPatchTelco` check, sweeps polymorphic dependents in a
   * transaction, writes an audit row, and triggers cache revalidation. We only need to
   * confirm with the user and refresh the route on success. */
  async function handleDelete(id: string, name: string) {
    if (!(await confirm(deleteTelcoMessage(name)))) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/telcos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      showAdminActionToast(toast, "deleted", "telco", { name });
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const pagerItems = useMemo(() => pageNumbers(page, totalPages), [page, totalPages]);

  function sortHref(column: TelcoSortKey, targetPage = 1): string {
    const next = nextSortState(column, sortBy, sortDir);
    return buildTelcosListHref(targetPage, pageSize, defaultPageSize, searchQuery, next.sort, next.dir);
  }

  function sortIndicator(column: TelcoSortKey): string {
    if (sortBy !== column) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  const sortableTh = (label: string, column: TelcoSortKey) => (
    <th aria-sort={sortBy === column ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink href={sortHref(column, 1)} onNavigate={navigate} className="ds-table-sort">
        {label}
        <span aria-hidden>{sortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  const buildSearchHref = useCallback(
    (query: string) => buildTelcosListHref(1, pageSize, defaultPageSize, query, sortBy, sortDir),
    [pageSize, defaultPageSize, sortBy, sortDir],
  );

  const inputClass =
    adminLegacyInput;
  const selectClass = adminLegacyInput;

  const pageLinkClass =
    "inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition";
  const inactivePageClass = `${pageLinkClass} border-keyra-border bg-keyra-bg text-keyra-primary hover:border-black/20 hover:bg-keyra-surface`;
  const activePageClass = `${pageLinkClass} border-black/25 bg-keyra-bg font-semibold text-keyra-primary ring-1 ring-black/10`;

  return (
    <div>
      {/* Hero */}
      <div className={adminPanel}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={adminPageTitle}>Telcos</h1>
              <span className={adminCountBadge}>
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              Full telco catalog — click any column header to sort. Default order is newest first.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, slug, subdomain, country…"
              ariaLabel="Search telcos"
            />
            <Link
              href="/api/admin/deployments/telcos/csv"
              prefetch={false}
              className="ds-btn-secondary is-sm"
            >
              Download CSV
            </Link>
            {canUseCreate ? (
              <button
                type="button"
                className={createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create telco"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Expandable create — fields aligned with `/admin/deployments/telcos/[id]` edit form */}
        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New telco</h2>
            <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
              Same fields as the telco edit screen. Leave Telco subdomain empty to derive it from the country and slug.
            </p>

            <form action={createTelco} className="ds-feature-card is-dashboard mt-4 space-y-4">
              <input type="hidden" name="_telcosPageSize" value={pagination.pageSize} />
              <label className={adminLabel}>
                Country
                <select name="countryId" required className={selectClass}>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.iso2})
                    </option>
                  ))}
                </select>
              </label>
              <label className={adminLabel}>
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Slug
                <input name="slug" required placeholder="telco-slug" className={inputClass} />
              </label>
              <label className={adminLabel}>
                Telco subdomain
                <input
                  name="telcoSubdomain"
                  placeholder="Optional — derived from country + slug if empty"
                  className={inputClass}
                />
              </label>
              <label className={adminLabel}>
                Official domain
                <input name="officialDomain" className={inputClass} placeholder="example.com" />
              </label>
              <label className={adminLabel}>
                Status
                <select name="status" className={selectClass} defaultValue={STATUS_OPTIONS[0]}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className={adminLabel}>
                Status change reason (optional)
                <input
                  name="statusChangeReason"
                  className={inputClass}
                  placeholder="Recorded on initial status history for this telco"
                />
              </label>
              <label className={adminLabel}>
                Status note
                <input name="statusNote" className={inputClass} />
              </label>
              <label className={adminLabel}>
                Subscribers
                <input name="subscribers" type="number" min={0} className={inputClass} placeholder="Numeric count" />
              </label>
              <label className={adminLabel}>
                Subscribers display
                <input name="subscribersDisplay" className={inputClass} placeholder='e.g. "120M+"' />
              </label>
              <label className={adminLabel}>
                Source label
                <input name="sourceLabel" className={inputClass} />
              </label>
              <label className={adminLabel}>
                Source URL
                <input name="sourceUrl" type="url" className={inputClass} />
              </label>
              <label className={adminLabel}>
                Source verified at (ISO)
                <input name="sourceVerifiedAt" type="datetime-local" className={inputClass} />
              </label>
              <label className={adminLabel}>
                Sort order
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </label>
              <label className={adminFormCheckboxLabelWide}>
                <input name="isPublished" type="checkbox" className={adminCheckbox} />
                Published
              </label>
              <div className="pt-2">
                <Button type="submit" variant="primary">
                  Create telco
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>


      {/* Delete-error banner — surfaced above the table so it's visible without scrolling. */}
      {deleteError ? (
        <p className="mt-3 ds-admin-error-banner">
          {deleteError}
        </p>
      ) : null}

      {/* Table */}
      <div className={`${adminTableWrap} mt-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableScroll}>
          <table className={`${adminTable} min-w-[42rem]`}>
            <thead>
              <tr>
                {sortableTh("Telco", "name")}
                {sortableTh("Country", "country")}
                {sortableTh("Subdomain", "subdomain")}
                {sortableTh("Status", "status")}
                {sortableTh("Published", "published")}
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {telcos.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={6}
                  hasSearch={hasSearch}
                  entityName="telcos"
                />
              ) : (
                telcos.map((t) => {
                  const isDeleting = deletingId === t.id;
                  return (
                    <tr key={t.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>{t.name}</td>
                      <td className="is-muted">
                        {t.country.name}{" "}
                        <span className="text-[var(--ds-muted)]">({t.country.iso2})</span>
                      </td>
                      <td className="max-w-[10rem] truncate font-mono text-xs">{t.telcoSubdomain}</td>
                      <td>
                        <span className="ds-status-pill">
                          {t.status}
                        </span>
                      </td>
                      <td className="is-muted">{t.isPublished ? "Yes" : "No"}</td>
                      <td className="is-actions">
                        <RowActions
                          editHref={`/admin/deployments/telcos/${t.id}`}
                          editAriaLabel={`Edit ${t.name}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete ${t.name}`}
                          onDelete={() => void handleDelete(t.id, t.name)}
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

        {/* Pagination */}
        {totalCount > 0 ? (
          <div className="flex flex-col gap-3 border-t border-keyra-border bg-keyra-bg/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className={adminLabel}>
              Page{" "}
              <span className="font-semibold text-keyra-primary">{page}</span> of{" "}
              <span className="font-semibold text-keyra-primary">{totalPages}</span>
              <span className="text-keyra-text-2">
                {" "}
                ({showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {totalCount.toLocaleString()})
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium uppercase tracking-wide text-keyra-text-2">Rows</span>
              {pageSizeOptions.map((sz) =>
                sz === pageSize ? (
                  <span
                    key={sz}
                    className={`${activePageClass} pointer-events-none min-w-14 cursor-default`}
                    aria-current="page"
                  >
                    {sz}
                  </span>
                ) : (
                  <AdminTransitionLink
                    key={sz}
                    href={buildTelcosListHref(1, sz, defaultPageSize, searchQuery, sortBy, sortDir)}
                    onNavigate={navigate}
                    className={inactivePageClass}
                  >
                    {sz}
                  </AdminTransitionLink>
                ),
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <AdminTransitionLink
                href={buildTelcosListHref(Math.max(1, page - 1), pageSize, defaultPageSize, searchQuery, sortBy, sortDir)}
                onNavigate={navigate}
                aria-disabled={page <= 1}
                className={`${inactivePageClass} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
              >
                Previous
              </AdminTransitionLink>
              {pagerItems.map((item, i) =>
                item === "gap" ? (
                  <span key={`gap-${i}`} className="px-2 text-keyra-text-2">
                    …
                  </span>
                ) : item === page ? (
                  <span key={item} className={`${activePageClass} pointer-events-none min-w-10`}>
                    {item}
                  </span>
                ) : (
                  <AdminTransitionLink
                    key={item}
                    href={buildTelcosListHref(item, pageSize, defaultPageSize, searchQuery, sortBy, sortDir)}
                    onNavigate={navigate}
                    className={inactivePageClass}
                  >
                    {item}
                  </AdminTransitionLink>
                ),
              )}
              <AdminTransitionLink
                href={buildTelcosListHref(Math.min(totalPages, page + 1), pageSize, defaultPageSize, searchQuery, sortBy, sortDir)}
                onNavigate={navigate}
                aria-disabled={page >= totalPages}
                className={`${inactivePageClass} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
              >
                Next
              </AdminTransitionLink>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-xs leading-5 text-keyra-text-2">
        CSV import: POST the CSV body to{" "}
        <code className="rounded-md bg-keyra-bg px-1.5 py-0.5 font-mono text-[11px] text-keyra-primary">
          /api/admin/deployments/telcos/csv
        </code>
        .
      </p>
    </div>
  );
}