"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeploymentAdminRole } from "@prisma/client";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteAdminUserMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { TablePagination } from "@/components/admin/TablePagination";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { buildListHref } from "@/lib/admin/listSearchParams";
import { useAdminRouteTransition } from "@/lib/admin/useAdminRouteTransition";
import {
  type AdminUserFieldErrors,
  validateAdminUserCreate,
} from "@/lib/adminUserValidation";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phoneCountryOptions";
import {
  adminBody,
  adminCheckbox,
  adminFormCheckboxLabel,
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
  const router = useRouter();
  const confirm = useAdminConfirm();
  const { isPending, navigate } = useAdminRouteTransition();
  const toast = useToast();
  const { page, pageSize, totalCount, totalPages, showingFrom, showingTo } = pagination;

  async function handleDelete(id: string, name: string) {
    if (!(await confirm(deleteAdminUserMessage(name)))) return;
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
      showAdminActionToast(toast, "deleted", "admin-user", { name });
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

  const buildSearchHref = (query: string) =>
    buildListHref(baseHref, { page: 1, pageSize, searchQuery: query }, defaultPageSize);

  const buildPaginationHref = (nextPage: number, nextPageSize: number) =>
    buildListHref(baseHref, { page: nextPage, pageSize: nextPageSize, searchQuery }, defaultPageSize);

  const inputClass = fieldClass(adminLegacyInput, false);
  const selectClass = adminLegacyInput;

  return (
    <div>
      <div className={adminPanel}>
        <AdminDirectoryPageHeader
          title="Admin users"
          badge={<span className={adminCountBadge}>{totalCount.toLocaleString()} total</span>}
          description="Manage deployment admin accounts — search by name, email, or mobile number."
          search={
            <CollapsibleSearchBar
              searchQuery={searchQuery}
              buildHref={buildSearchHref}
              placeholder="Name, email, mobile…"
              ariaLabel="Search admin users"
            />
          }
          actions={
            showCreate ? (
              <button
                type="button"
                className={createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Add user"}
              </button>
            ) : null
          }
        />

        {showCreate && createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>New admin user</h2>
            <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>Add a user with name, mobile number, and email.</p>

            {createError ? <p className="mt-3 ds-admin-error-banner">{createError}</p> : null}

            <form onSubmit={(e) => void handleCreate(e)} className="ds-feature-card is-dashboard mt-4 space-y-4" noValidate>
              <label className={adminLabel}>
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

              <label className={adminLabel}>
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

              <label className={adminLabel}>
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

              <label className={adminFormCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className={adminCheckbox}
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

      <div className={`${adminTableWrap} mt-3 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableScroll}>
          <table className={`${adminTable} min-w-[42rem]`}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th className="is-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
                    <tr key={u.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>{u.displayName?.trim() || "—"}</td>
                      <td className="is-muted ds-numeric">
                        {u.phoneE164 ? formatPhoneDisplay(u.phoneE164) : "—"}
                      </td>
                      <td className="is-muted">{u.email}</td>
                      <td>
                        <span className="ds-status-pill">{ROLE_LABELS[u.role]}</span>
                      </td>
                      <td className="is-muted">{u.isActive ? "Yes" : "No"}</td>
                      <td className="is-actions">
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

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          showingFrom={showingFrom}
          showingTo={showingTo}
          pageSizeOptions={pageSizeOptions}
          buildHref={buildPaginationHref}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}