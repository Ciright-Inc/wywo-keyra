"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteRegionMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { useToast } from "@/components/ui/Toast";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
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
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

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
  const confirm = useAdminConfirm();
  const toast = useToast();
  const { isPending, navigate } = useAdminRouteTransition();
  const { page, pageSize, totalCount } = pagination;

  /** Delete a region via the server route. The route handles cascade + audit + revalidate;
   * client just confirms (with cascade warning) and refreshes. */
  async function handleDelete(id: string, name: string) {
    if (!(await confirm(deleteRegionMessage(name)))) return;
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
      showAdminActionToast(toast, "deleted", "region", { name });
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    adminLegacyInput;

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
    <th aria-sort={sortBy === column ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink href={sortHref(column)} onNavigate={navigate} className="ds-table-sort">
        {label}
        <span aria-hidden>{sortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  return (
    <div>
      {/* Hero */}
      <div className={adminPanel}>
        <AdminDirectoryPageHeader
          title="Regions"
          badge={<span className={adminCountBadge}>{totalCount.toLocaleString()} total</span>}
          description="Formal UN M49 macro + subregion codes, with UI map keys. Click any column header to sort."
          search={
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, slug, map key…"
              ariaLabel="Search regions"
            />
          }
          actions={
            showCreate ? (
              <button
                type="button"
                className={createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create region"}
              </button>
            ) : null
          }
        />

        {showCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New region</h2>
            <form action={createRegion} className="ds-form-grid ds-form-grid--2 mt-4">
              <label className={`${adminLabel} sm:col-span-2`}>
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Slug
                <input name="slug" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Map key
                <input name="mapKey" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Continent code (M49)
                <input name="continentCode" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Subregion code (M49)
                <input name="subregionCode" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Sort order
                <input name="sortOrder" defaultValue="0" className={inputClass} />
              </label>
              <label className={adminFormCheckboxLabelWide}>
                <input name="isPublished" type="checkbox" className={adminCheckbox} />
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
      <div className={`${adminTableWrap} mt-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableScroll}>
          <table className={`${adminTable} min-w-[36rem]`}>
            <thead>
              <tr>
                {sortableTh("Name", "name")}
                {sortableTh("Slug", "slug")}
                {sortableTh("Map", "map")}
                {sortableTh("Published", "published")}
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
                    <tr key={r.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>{r.name}</td>
                      <td className="is-muted">{r.slug}</td>
                      <td className="is-muted">{r.mapKey}</td>
                      <td className="is-muted">{r.isPublished ? "Yes" : "No"}</td>
                      <td className="is-actions">
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
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}