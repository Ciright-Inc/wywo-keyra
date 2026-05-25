"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteCountryMessage } from "@/lib/admin/adminDeleteMessages";
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
    adminLegacyInput;
  const selectClass = adminLegacyInput;

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
    <th aria-sort={sortBy === column ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink href={sortHref(column)} onNavigate={navigate} className="ds-table-sort">
        {label}
        <span aria-hidden>{sortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  const canUseCreate = showCreate && regions.length > 0;

  return (
    <div>
      <div className={adminPanel}>
        <AdminDirectoryPageHeader
          title="Countries"
          badge={<span className={adminCountBadge}>{totalCount.toLocaleString()} total</span>}
          description="Scoped to your admin role. Click any column header to sort."
          search={
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, ISO, region, subdomain, status…"
              ariaLabel="Search countries"
            />
          }
          actions={
            <>
              <Link
                href="/api/admin/deployments/countries/csv"
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
                  {createOpen ? "Close create form" : "Create country"}
                </button>
              ) : null}
            </>
          }
        />

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New country</h2>
            <form action={createCountry} className="ds-form-grid ds-form-grid--2 mt-4">
              <label className={`${adminLabel} sm:col-span-2`}>
                Region
                <select name="regionId" required className={selectClass}>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className={adminLabel}>
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                ISO2
                <input name="iso2" required maxLength={2} className={inputClass} />
              </label>
              <label className={adminLabel}>
                ISO3
                <input name="iso3" required maxLength={3} className={inputClass} />
              </label>
              <label className={adminLabel}>
                Flag asset key
                <input name="flagAssetKey" required className={inputClass} />
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Country subdomain
                <input name="countrySubdomain" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Status
                <select name="status" className={selectClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className={adminLabel}>
                Sort order
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Population (optional)
                <input name="population" type="number" className={inputClass} />
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Population display
                <input name="populationDisplay" className={inputClass} />
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Official reference domain
                <input name="officialReferenceDomain" className={inputClass} />
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

      <div className={`${adminTableWrap} mt-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableScroll}>
          <table className={`${adminTable} min-w-[36rem]`}>
            <thead>
              <tr>
                {sortableTh("Country", "name")}
                {sortableTh("Region", "region")}
                {sortableTh("ISO2", "iso2")}
                {sortableTh("Subdomain", "subdomain")}
                {sortableTh("Status", "status")}
                {sortableTh("Published", "published")}
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
                    <tr key={c.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>{c.name}</td>
                      <td className="is-muted">{c.region.name}</td>
                      <td className="is-muted">{c.iso2}</td>
                      <td className="max-w-[12rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {c.countrySubdomain}
                      </td>
                      <td className="px-3 py-2">
                        <span className="ds-status-pill">
                          {c.status}
                        </span>
                      </td>
                      <td className="is-muted">{c.isPublished ? "Yes" : "No"}</td>
                      <td className="is-actions">
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