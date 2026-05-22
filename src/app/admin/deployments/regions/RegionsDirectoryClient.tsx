"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";

export type RegionSortKey = "name" | "slug" | "map" | "published" | "sortOrder";

export type RegionRow = {
  id: string;
  name: string;
  slug: string;
  mapKey: string;
  isPublished: boolean;
};

type Props = {
  regions: RegionRow[];
  pagination: TablePaginationMeta;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  searchQuery: string;
  sortBy: RegionSortKey;
  sortDir: "asc" | "desc";
  showCreate: boolean;
  /** Mirrors the server-side mutate check — gates the trash icon. */
  canDelete: boolean;
  /** Server action bound from the parent Server Component */
  createRegion: (formData: FormData) => Promise<void>;
};

const BASE_HREF = "/admin/deployments/regions";

function sortListExtra(sortBy: RegionSortKey, sortDir: "asc" | "desc") {
  if (sortBy === "sortOrder" && sortDir === "asc") return undefined;
  return { sort: sortBy === "sortOrder" ? undefined : sortBy, dir: sortDir };
}

function nextSortState(
  column: RegionSortKey,
  sortBy: RegionSortKey,
  sortDir: "asc" | "desc",
): { sort: RegionSortKey; dir: "asc" | "desc" } {
  if (sortBy === column) return { sort: column, dir: sortDir === "asc" ? "desc" : "asc" };
  return { sort: column, dir: "asc" };
}

export function RegionsDirectoryClient({
  regions,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  sortBy,
  sortDir,
  showCreate,
  canDelete,
  createRegion,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const { page, pageSize, totalCount } = pagination;

  /** Delete a region via the server route. The route handles cascade + audit + revalidate;
   * client just confirms (with cascade warning) and refreshes. */
  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Delete region "${name}"? This also deletes every country and telco under it. This cannot be undone.`,
      )
    )
      return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/regions/${id}`, {
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

  function sortHref(column: RegionSortKey): string {
    const next = nextSortState(column, sortBy, sortDir);
    return buildListHref(
      BASE_HREF,
      { page: 1, pageSize, searchQuery },
      defaultPageSize,
      sortListExtra(next.sort, next.dir),
    );
  }

  function sortIndicator(column: RegionSortKey): string {
    if (sortBy !== column) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  const sortableTh = (label: string, column: RegionSortKey) => (
    <th className="px-3 py-2" aria-sort={sortBy === column ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <Link
        href={sortHref(column)}
        prefetch={false}
        className="inline-flex items-center gap-0.5 font-semibold text-keyra-text-2 transition hover:text-keyra-primary"
      >
        {label}
        <span aria-hidden>{sortIndicator(column)}</span>
      </Link>
    </th>
  );

  return (
    <div>
      {/* Hero */}
      <div className="ds-panel is-dashboard">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Regions</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
              Formal UN M49 macro + subregion codes, with UI map keys. Click any column header to sort.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, slug, map key…"
              ariaLabel="Search regions"
            />
            {showCreate ? (
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
                  createOpen
                    ? "border border-[var(--keyra-action-border)] bg-keyra-bg text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                    : "bg-[var(--keyra-action)] text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                }`}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create region"}
              </button>
            ) : null}
          </div>
        </div>

        {showCreate && createOpen ? (
          <div className="mt-5 border-t border-keyra-border pt-5">
            <h2 className="text-lg font-semibold text-keyra-primary">New region</h2>
            <form action={createRegion} className="keyra-card mt-4 grid gap-3 p-5 sm:grid-cols-2">
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Slug
                <input name="slug" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Map key
                <input name="mapKey" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Continent code (M49)
                <input name="continentCode" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Subregion code (M49)
                <input name="subregionCode" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Sort order
                <input name="sortOrder" defaultValue="0" className={inputClass} />
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

      {/* Table */}
      <div className="ds-table-wrap mt-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                {sortableTh("Name", "name")}
                {sortableTh("Slug", "slug")}
                {sortableTh("Map", "map")}
                {sortableTh("Published", "published")}
                <th className="w-px whitespace-nowrap px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {regions.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={5}
                  hasSearch={hasSearch}
                  entityName="regions"
                />
              ) : (
                regions.map((r) => {
                  const isDeleting = deletingId === r.id;
                  return (
                    <tr key={r.id} className={`transition hover:bg-keyra-surface ${isDeleting ? "opacity-60" : ""}`}>
                      <td className="px-3 py-2 font-medium text-keyra-primary">{r.name}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{r.slug}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{r.mapKey}</td>
                      <td className="px-3 py-2 text-keyra-text-2">{r.isPublished ? "Yes" : "No"}</td>
                      <td className="w-px whitespace-nowrap px-2 py-2 text-right">
                        <RowActions
                          editHref={`/admin/deployments/regions/${r.id}`}
                          editAriaLabel={`Edit ${r.name}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete ${r.name}`}
                          onDelete={() => void handleDelete(r.id, r.name)}
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
