"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DeploymentAdminRole } from "@prisma/client";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { RowActions } from "@/components/admin/RowActions";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { buildListHref } from "@/lib/admin/listSearchParams";
import {
  type AdminUserFieldErrors,
  validateAdminUserCreate,
} from "@/lib/adminUserValidation";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phoneCountryOptions";

const ROLE_OPTIONS = Object.values(DeploymentAdminRole);

const ROLE_LABELS: Record<DeploymentAdminRole, string> = {
  GLOBAL_ADMIN: "Global admin",
  REGIONAL_ADMIN: "Regional admin",
  COUNTRY_ADMIN: "Country admin",
  TELCO_ADMIN: "Telco admin",
  COMPLIANCE_REVIEWER: "Compliance reviewer",
  READ_ONLY: "Read only",
};

export type AdminUserRow = {
  id: string;
  displayName: string | null;
  email: string;
  phoneE164: string | null;
  role: DeploymentAdminRole;
  isActive: boolean;
};

export type AdminUserPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
};

type Props = {
  users: AdminUserRow[];
  pagination: AdminUserPagination;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  searchQuery: string;
  showCreate: boolean;
  canDelete: boolean;
};

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

export function AdminUsersDirectoryClient({
  users,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  searchQuery,
  showCreate,
  canDelete,
}: Props) {
  const baseHref = "/admin/deployments/admin-users";
  const hasSearch = searchQuery.trim().length > 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(hasSearch);
  const [qInput, setQInput] = useState(searchQuery);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AdminUserFieldErrors>({});
  const [createPending, setCreatePending] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<DeploymentAdminRole>(DeploymentAdminRole.READ_ONLY);
  const [isActive, setIsActive] = useState(true);
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const [phoneNational, setPhoneNational] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const toast = useToast();
  const { page, pageSize, totalCount, totalPages, showingFrom, showingTo } = pagination;

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete admin user "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/deployments/admin-users/${id}`, {
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

  function clearField(field: keyof AdminUserFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const validated = validateAdminUserCreate({
      displayName,
      email,
      phoneCountryCode,
      phoneNational,
      role,
      isActive,
    });

    if (!validated.ok) {
      setFieldErrors(validated.errors);
      setCreateError(validated.message);
      return;
    }

    setFieldErrors({});
    setCreatePending(true);
    try {
      const res = await fetch("/api/admin/deployments/admin-users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          phoneCountryCode,
          phoneNational,
          role,
          isActive,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: AdminUserFieldErrors;
      };
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        throw new Error(data.error ?? `Create failed (${res.status})`);
      }

      const createdName = displayName.trim();
      setDisplayName("");
      setEmail("");
      setPhoneCountryCode(DEFAULT_PHONE_COUNTRY_CODE);
      setPhoneNational("");
      setRole(DeploymentAdminRole.READ_ONLY);
      setIsActive(true);
      setFieldErrors({});
      setCreateOpen(false);
      toast.success(
        "User created successfully",
        createdName ? `${createdName} has been added to admin users.` : "The admin user has been added.",
      );
      router.refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreatePending(false);
    }
  }

  const pagerItems = useMemo(() => pageNumbers(page, totalPages), [page, totalPages]);

  useEffect(() => {
    setQInput(searchQuery);
    if (searchQuery.trim()) setSearchExpanded(true);
  }, [searchQuery]);

  useEffect(() => {
    if (searchExpanded) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchExpanded]);

  useEffect(() => {
    const next = qInput.trim();
    if (next === searchQuery.trim()) return;
    const t = setTimeout(() => {
      router.push(
        buildListHref(baseHref, { page: 1, pageSize, searchQuery: next }, defaultPageSize),
      );
    }, 280);
    return () => clearTimeout(t);
  }, [qInput, searchQuery, router, pageSize, defaultPageSize, baseHref]);

  function toggleSearchPanel() {
    setSearchExpanded((open) => !open);
  }

  function collapseSearch(clearQuery: boolean) {
    if (clearQuery) {
      setQInput("");
      if (hasSearch) {
        router.push(
          buildListHref(baseHref, { page: 1, pageSize, searchQuery: "" }, defaultPageSize),
        );
      }
    }
    setSearchExpanded(false);
  }

  const inputClass = fieldClass(
    "mt-1 h-10 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary shadow-sm outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60",
    false,
  );
  const selectClass = `${inputClass} bg-keyra-bg`;
  const pageLinkClass =
    "inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition";
  const inactivePageClass = `${pageLinkClass} border-keyra-border bg-keyra-bg text-keyra-primary hover:border-black/20 hover:bg-keyra-surface`;
  const activePageClass = `${pageLinkClass} border-black/25 bg-keyra-bg font-semibold text-keyra-primary ring-1 ring-black/10`;

  return (
    <div>
      <div className="ds-panel is-dashboard">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Admin users</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
              Manage deployment admin accounts — search by name, email, or mobile number.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleSearchPanel}
                aria-label={searchExpanded ? "Collapse search" : "Expand search"}
                aria-expanded={searchExpanded}
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition duration-300 ${
                  searchExpanded || hasSearch
                    ? "border-black/20 bg-keyra-bg text-keyra-primary ring-1 ring-black/10"
                    : "border-keyra-border bg-keyra-bg text-keyra-text-2 hover:border-black/20 hover:text-keyra-primary"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20 16.65 16.65" />
                </svg>
              </button>
              <div
                className={`grid transition-[grid-template-columns] duration-300 ease-out ${
                  searchExpanded ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={qInput}
                      onChange={(e) => setQInput(e.target.value)}
                      placeholder="Name, email, mobile…"
                      autoComplete="off"
                      aria-label="Search admin users"
                      className={`h-9 rounded-lg border border-keyra-border bg-keyra-bg py-0 pl-3 text-sm text-keyra-primary outline-none transition-opacity duration-300 focus-visible:border-black/25 focus-visible:keyra-focus ${
                        searchExpanded ? "w-44 pr-8 opacity-100 sm:w-64" : "w-44 pointer-events-none opacity-0 sm:w-64"
                      }`}
                    />
                    {searchExpanded ? (
                      <button
                        type="button"
                        className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary"
                        onClick={() => collapseSearch(true)}
                        aria-label="Clear search and collapse"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
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
                {createOpen ? "Close create form" : "Add user"}
              </button>
            ) : null}
          </div>
        </div>

        {showCreate && createOpen ? (
          <div className="mt-5 border-t border-keyra-border pt-5">
            <h2 className="text-lg font-semibold text-keyra-primary">New admin user</h2>
            <p className="mt-1 text-sm text-keyra-text-2">Add a user with name, mobile number, and email.</p>

            {createError ? <p className="mt-3 ds-admin-error-banner">{createError}</p> : null}

            <form onSubmit={(e) => void handleCreate(e)} className="ds-feature-card is-dashboard mt-4 space-y-4" noValidate>
              <label className="block text-sm text-keyra-text-2">
                Name
                <input
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    clearField("displayName");
                  }}
                  className={fieldClass(inputClass, Boolean(fieldErrors.displayName))}
                  placeholder="Full name"
                  aria-invalid={Boolean(fieldErrors.displayName) || undefined}
                />
                <AdminFieldError message={fieldErrors.displayName} />
              </label>

              <AdminPhoneField
                idBase="admin-user-create"
                label="Mobile number"
                phoneCountryCode={phoneCountryCode}
                nationalValue={phoneNational}
                onPhoneCountryChange={(code) => {
                  setPhoneCountryCode(code);
                  clearField("phone");
                  clearField("phoneCountryCode");
                }}
                onNationalChange={(value) => {
                  setPhoneNational(value);
                  clearField("phone");
                  clearField("phoneNational");
                }}
                phoneError={fieldErrors.phone ?? fieldErrors.phoneNational}
                countryError={fieldErrors.phoneCountryCode}
              />

              <label className="block text-sm text-keyra-text-2">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearField("email");
                  }}
                  className={fieldClass(inputClass, Boolean(fieldErrors.email))}
                  placeholder="admin@example.com"
                  aria-invalid={Boolean(fieldErrors.email) || undefined}
                />
                <AdminFieldError message={fieldErrors.email} />
              </label>

              <label className="block text-sm text-keyra-text-2">
                Role
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as DeploymentAdminRole);
                    clearField("role");
                  }}
                  className={fieldClass(selectClass, Boolean(fieldErrors.role))}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <AdminFieldError message={fieldErrors.role} />
              </label>

              <label className="flex items-center gap-3 text-sm text-keyra-text-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded border-keyra-border accent-keyra-primary"
                />
                Active
              </label>

              <div className="pt-2">
                <Button type="submit" variant="primary" disabled={createPending}>
                  {createPending ? "Creating…" : "Create user"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {deleteError ? <p className="mt-3 ds-admin-error-banner">{deleteError}</p> : null}

      <div className="ds-table-wrap mt-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Mobile</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
                <th className="w-px whitespace-nowrap px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {users.length === 0 ? (
                <AdminListEmptyState
                  variant="table-row"
                  colSpan={6}
                  hasSearch={hasSearch}
                  entityName="admin users"
                />
              ) : (
                users.map((u) => {
                  const isDeleting = deletingId === u.id;
                  const label = u.displayName?.trim() || u.email;
                  return (
                    <tr key={u.id} className={`transition hover:bg-keyra-surface ${isDeleting ? "opacity-60" : ""}`}>
                      <td className="px-3 py-2 font-medium text-keyra-primary">{u.displayName?.trim() || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {u.phoneE164 ? formatPhoneDisplay(u.phoneE164) : "—"}
                      </td>
                      <td className="px-3 py-2 text-keyra-text-2">{u.email}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-xs font-medium text-keyra-primary">
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-keyra-text-2">{u.isActive ? "Yes" : "No"}</td>
                      <td className="w-px whitespace-nowrap px-2 py-2 text-right">
                        <RowActions
                          editHref={`/admin/deployments/admin-users/${u.id}`}
                          editAriaLabel={`Edit ${label}`}
                          canDelete={canDelete}
                          deleteAriaLabel={`Delete ${label}`}
                          onDelete={() => void handleDelete(u.id, label)}
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

        {totalCount > defaultPageSize ? (
          <div className="flex flex-col gap-3 border-t border-keyra-border bg-keyra-bg/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm text-keyra-text-2">
              Page <span className="font-semibold text-keyra-primary">{page}</span> of{" "}
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
                  <span key={sz} className={`${activePageClass} pointer-events-none min-w-14 cursor-default`} aria-current="page">
                    {sz}
                  </span>
                ) : (
                  <Link key={sz} href={buildListHref(baseHref, { page: 1, pageSize: sz, searchQuery }, defaultPageSize)} prefetch={false} className={inactivePageClass}>
                    {sz}
                  </Link>
                ),
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={buildListHref(baseHref, { page: Math.max(1, page - 1), pageSize, searchQuery }, defaultPageSize)}
                prefetch={false}
                aria-disabled={page <= 1}
                className={`${inactivePageClass} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
              >
                Previous
              </Link>
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
                  <Link key={item} href={buildListHref(baseHref, { page: item, pageSize, searchQuery }, defaultPageSize)} prefetch={false} className={inactivePageClass}>
                    {item}
                  </Link>
                ),
              )}
              <Link
                href={buildListHref(baseHref, { page: Math.min(totalPages, page + 1), pageSize, searchQuery }, defaultPageSize)}
                prefetch={false}
                aria-disabled={page >= totalPages}
                className={`${inactivePageClass} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
