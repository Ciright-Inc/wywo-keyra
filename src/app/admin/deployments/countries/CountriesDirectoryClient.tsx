"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteCountryMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { useToast } from "@/components/ui/Toast";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";
import { useAdminRouteTransition } from "@/lib/admin/useAdminRouteTransition";

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

export type CountrySortKey = "name" | "region" | "iso2" | "subdomain" | "status" | "published" | "sortOrder";

export type CountryRow = {
  id: string;
  name: string;
  iso2: string;
  countrySubdomain: string;
  status: string;
  isPublished: boolean;
  region: { name: string; slug: string };
};

type RegionOption = { id: string; name: string; slug: string };

type Props = {
  countries: CountryRow[];
  pagination: TablePaginationMeta;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  searchQuery: string;
  sortBy: CountrySortKey;
  sortDir: "asc" | "desc";
  regions: RegionOption[];
  showCreate: boolean;
  /** Mirrors the server-side mutate check — gates the trash icon. */
  canDelete: boolean;
  /** Server action bound from the parent Server Component */
  createCountry: (formData: FormData) => Promise<void>;
};

const BASE_HREF = "/admin/deployments/countries";

function sortListExtra(sortBy: CountrySortKey, sortDir: "asc" | "desc") {
  if (sortBy === "sortOrder" && sortDir === "asc") return undefined;
  return { sort: sortBy === "sortOrder" ? undefined : sortBy, dir: sortDir };
}

function nextSortState(
  column: CountrySortKey,
  sortBy: CountrySortKey,
  sortDir: "asc" | "desc",
): { sort: CountrySortKey; dir: "asc" | "desc" } {
  if (sortBy === column) return { sort: column, dir: sortDir === "asc" ? "desc" : "asc" };
  return { sort: column, dir: "asc" };
}

export function CountriesDirectoryClient({
  countries,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  sortBy,
  sortDir,
  regions,
  showCreate,
  canDelete,
  createCountry,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useAdminConfirm();
  const toast = useToast();
  const { isPending, navigate } = useAdminRouteTransition();
  const { page, pageSize, totalCount } = pagination;

  /** Delete a country via the server route. The route sweeps polymorphic dependents and
   * cascades any descendant telcos; client just confirms and refreshes. */
  async function handleDelete(id: string, name: string) {
    if (!(await confirm(deleteCountryMessage(name)))) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/countries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      showAdminActionToast(toast, "deleted", "country", { name });
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
    (query: string) =>
      buildListHref(
        BASE_HREF,
        { page: 1, pageSize, searchQuery: query },
        defaultPageSize,
        sortListExtra(sortBy, sortDir),
      ),
    [pageSize, defaultPageSize, sortBy, sortDir],
  );

  const buildPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildListHref(
        BASE_HREF,
        { page: nextPage, pageSize: nextPageSize, searchQuery },
        defaultPageSize,
        sortListExtra(sortBy, sortDir),
      ),
    [searchQuery, defaultPageSize, sortBy, sortDir],
  );

  function sortHref(column: CountrySortKey): string {
    const next = nextSortState(column, sortBy, sortDir);
    return buildListHref(
      BASE_HREF,
      { page: 1, pageSize, searchQuery },
      defaultPageSize,
      sortListExtra(next.sort, next.dir),
    );
  }

  function sortIndicator(column: CountrySortKey): string {
    if (sortBy !== column) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  const sortableTh = (label: string, column: CountrySortKey) => (
    <th className="px-3 py-2" aria-sort={sortBy === column ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink
        href={sortHref(column)}
        onNavigate={navigate}
        className="inline-flex items-center gap-0.5 font-semibold text-keyra-text-2 transition hover:text-keyra-primary"
      >
        {label}
        <span aria-hidden>{sortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  const canUseCreate = showCreate && regions.length > 0;

  return (
    <div>
      <div className="ds-panel is-dashboard">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Countries</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
              Scoped to your admin role. Click any column header to sort.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, ISO, region, subdomain, status…"
              ariaLabel="Search countries"
            />
            <Link
              href="/api/admin/deployments/countries/csv"
              prefetch={false}
              className="inline-flex items-center justify-center rounded-full border border-keyra-border bg-keyra-bg px-3.5 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
            >
              Download CSV
            </Link>
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
                {createOpen ? "Close create form" : "Create country"}
              </button>
            ) : null}
          </div>
        </div>

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-keyra-border pt-5">
            <h2 className="text-lg font-semibold text-keyra-primary">New country</h2>
            <form action={createCountry} className="keyra-card mt-4 grid gap-3 p-5 sm:grid-cols-2">
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Region
                <select name="regionId" required className={selectClass}>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-keyra-text-2">
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                ISO2
                <input name="iso2" required maxLength={2} className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                ISO3
                <input name="iso3" required maxLength={3} className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Flag asset key
                <input name="flagAssetKey" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Country subdomain
                <input name="countrySubdomain" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Status
                <select name="status" className={selectClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-keyra-text-2">
                Sort order
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Population (optional)
                <input name="population" type="number" className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Population display
                <input name="populationDisplay" className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Official reference domain
                <input name="officialReferenceDomain" className={inputClass} />
              </label>
              <label className="flex items-center gap-2 text-sm text-keyra-text-2 sm:col-span-2">
                <input name="isPublished" type="checkbox" className="size-4" />
                Published
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

      <div className={`ds-table-wrap mt-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                {sortableTh("Country", "name")}
                {sortableTh("Region", "region")}
                {sortableTh("ISO2", "iso2")}
                {sortableTh("Subdomain", "subdomain")}
                {sortableTh("Status", "status")}
                {sortableTh("Published", "published")}
                <th className="w-px whitespace-nowrap px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {countries.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={7}
                  hasSearch={hasSearch}
                  entityName="countries"
                />
              ) : (
                countries.map((c) => {
                  const isDeleting = deletingId === c.id;
                  return (
                    <tr key={c.id} className={`transition hover:bg-keyra-surface ${isDeleting ? "opacity-60" : ""}`}>
                      <td className="px-3 py-2 font-medium text-keyra-primary">{c.name}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{c.region.name}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{c.iso2}</td>
                      <td className="max-w-[12rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {c.countrySubdomain}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-xs font-medium text-keyra-primary">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-keyra-text-2">{c.isPublished ? "Yes" : "No"}</td>
                      <td className="w-px whitespace-nowrap px-2 py-2 text-right">
                        <RowActions
                          editHref={`/admin/deployments/countries/${c.id}`}
                          editAriaLabel={`Edit ${c.name}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete ${c.name}`}
                          onDelete={() => void handleDelete(c.id, c.name)}
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
          onNavigate={navigate}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-keyra-text-2">
        CSV import: POST the CSV body to{" "}
        <code className="rounded-md bg-keyra-bg px-1.5 py-0.5 font-mono text-[11px] text-keyra-primary">
          /api/admin/deployments/countries/csv
        </code>
        .
      </p>
    </div>
  );
}
