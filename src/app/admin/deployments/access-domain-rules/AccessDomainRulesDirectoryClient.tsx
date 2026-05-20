"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { buildListHref } from "@/lib/admin/listSearchParams";

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
  createAccessDomainRule,
}: Props) {
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const { page, pageSize, totalCount } = pagination;

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
      <div className="rounded-2xl border border-keyra-border bg-keyra-surface/60 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Access domain rules</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
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
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
                  createOpen
                    ? "border border-[var(--keyra-action-border)] bg-keyra-bg text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                    : "bg-[var(--keyra-action)] text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                }`}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create rule"}
              </button>
            ) : null}
          </div>
        </div>

        {canUseCreate && createOpen ? (
          <div className="mt-5 border-t border-keyra-border pt-5">
            <h2 className="text-lg font-semibold text-keyra-primary">New rule</h2>
            <form action={createAccessDomainRule} className="keyra-card mt-4 grid gap-3 p-5 sm:grid-cols-2">
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Target type
                <select name="targetType" required className={selectClass}>
                  <option value="COUNTRY">COUNTRY</option>
                  <option value="TELCO">TELCO</option>
                </select>
              </label>
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
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
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
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
              <label className="text-sm text-keyra-text-2 sm:col-span-2">
                Allowed email domain
                <input name="allowedEmailDomain" required className={inputClass} />
              </label>
              <label className="text-sm text-keyra-text-2">
                Verification method
                <select name="verificationMethod" className={selectClass}>
                  <option value="EMAIL_OTP">EMAIL_OTP</option>
                  <option value="SSO">SSO</option>
                  <option value="INVITE_ONLY">INVITE_ONLY</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-keyra-text-2">
                <input name="isActive" type="checkbox" defaultChecked className="size-4" />
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

      <div className="mt-3 overflow-hidden rounded-2xl border border-keyra-border bg-keyra-surface/45 shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-keyra-text-2">
                    {hasSearch
                      ? "No rules match your search. Try different keywords or clear the search."
                      : "No access domain rules visible to your account."}
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="transition hover:bg-keyra-surface">
                    <td className="max-w-[18rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                      {r.targetType} · {r.targetId}
                    </td>
                    <td className="px-3 py-2 font-medium text-keyra-primary">{r.allowedEmailDomain}</td>
                    <td className="px-3 py-2 text-keyra-text-2">{r.verificationMethod}</td>
                    <td className="px-3 py-2 text-keyra-text-2">{r.isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/deployments/access-domain-rules/${r.id}`}
                        className="text-sm font-medium text-keyra-accent underline-offset-4 transition hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
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
