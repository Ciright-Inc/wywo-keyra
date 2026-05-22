"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteAccessDomainRuleMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { useToast } from "@/components/ui/Toast";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";
import {
  adminBody,
  adminCheckbox,
  adminFormCheckboxLabel,
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

export type AccessDomainRuleRow = {
  id: string;
  targetType: string;
  targetId: string;
  allowedEmailDomain: string;
  verificationMethod: string;
  isActive: boolean;
};

type SelectOption = { id: string; label: string };

type Props = {
  rules: AccessDomainRuleRow[];
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
  createAccessDomainRule: (formData: FormData) => Promise<void>;
};

const BASE_HREF = "/admin/deployments/access-domain-rules";

export function AccessDomainRulesDirectoryClient({
  rules,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  countryOptions,
  telcoOptions,
  showCreate,
  canDelete,
  createAccessDomainRule,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const confirm = useAdminConfirm();
  const toast = useToast();
  const { page, pageSize, totalCount } = pagination;

  /** Delete an access domain rule via the server route. Auth/audit/revalidate server-side. */
  async function handleDelete(id: string, label: string) {
    if (!(await confirm(deleteAccessDomainRuleMessage(label)))) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/access-domain-rules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      showAdminActionToast(toast, "deleted", "access-domain-rule", { name: label });
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
              <h1 className={adminPageTitle}>Access domain rules</h1>
              <span className={adminCountBadge}>
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              Approved corporate email domains for governed access.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Domain or target id…"
              ariaLabel="Search access domain rules"
            />
            {canUseCreate ? (
              <button
                type="button"
                className={createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create rule"}
              </button>
            ) : null}
          </div>
        </div>

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New rule</h2>
            <form action={createAccessDomainRule} className="ds-form-grid ds-form-grid--2 mt-4">
              <label className={`${adminLabel} sm:col-span-2`}>
                Target type
                <select name="targetType" required className={selectClass}>
                  <option value="COUNTRY">COUNTRY</option>
                  <option value="TELCO">TELCO</option>
                </select>
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Country target
                <select name="targetIdCountry" className={selectClass}>
                  <option value="">—</option>
                  {countryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${adminLabel} sm:col-span-2`}>
                Telco target
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
                Allowed email domain
                <input name="allowedEmailDomain" required className={inputClass} />
              </label>
              <label className={adminLabel}>
                Verification method
                <select name="verificationMethod" className={selectClass}>
                  <option value="EMAIL_OTP">EMAIL_OTP</option>
                  <option value="SSO">SSO</option>
                  <option value="INVITE_ONLY">INVITE_ONLY</option>
                </select>
              </label>
              <label className={adminFormCheckboxLabel}>
                <input name="isActive" type="checkbox" defaultChecked className={adminCheckbox} />
                Active
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
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Active</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={5}
                  hasSearch={hasSearch}
                  entityName="access rules"
                />
              ) : (
                rules.map((r) => {
                  const isDeleting = deletingId === r.id;
                  return (
                    <tr key={r.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td className="max-w-[18rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {r.targetType} · {r.targetId}
                      </td>
                      <td>{r.allowedEmailDomain}</td>
                      <td className="is-muted">{r.verificationMethod}</td>
                      <td className="is-muted">{r.isActive ? "Yes" : "No"}</td>
                      <td className="is-actions">
                        <RowActions
                          editHref={`/admin/deployments/access-domain-rules/${r.id}`}
                          editAriaLabel={`Edit rule for ${r.allowedEmailDomain}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete rule for ${r.allowedEmailDomain}`}
                          onDelete={() => void handleDelete(r.id, r.allowedEmailDomain)}
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