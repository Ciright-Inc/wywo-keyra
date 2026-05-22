"use client";

import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  adminFormCheckboxLabel,
  adminFormStack,
  adminLabel,
  adminLegacyInput,
  adminPanel,
  adminSectionTitle,
  adminCheckbox,
} from "@/lib/admin/adminUiClasses";
import {
  type AdminUserFieldErrors,
  validateAdminUserUpdate,
} from "@/lib/adminUserValidation";
import { DeploymentAdminRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_OPTIONS = Object.values(DeploymentAdminRole);

const ROLE_LABELS: Record<DeploymentAdminRole, string> = {
  GLOBAL_ADMIN: "Global admin",
  REGIONAL_ADMIN: "Regional admin",
  COUNTRY_ADMIN: "Country admin",
  TELCO_ADMIN: "Telco admin",
  COMPLIANCE_REVIEWER: "Compliance reviewer",
  READ_ONLY: "Read only",
};

type Props = {
  user: {
    id: string;
    displayName: string | null;
    email: string;
    phoneCountryCode: string;
    phoneNational: string;
    role: DeploymentAdminRole;
    isActive: boolean;
  };
  canEdit: boolean;
};

export function AdminUserEditClient({ user, canEdit }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [email, setEmail] = useState(user.email);
  const [phoneCountryCode, setPhoneCountryCode] = useState(user.phoneCountryCode);
  const [phoneNational, setPhoneNational] = useState(user.phoneNational);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AdminUserFieldErrors>({});
  const [pending, setPending] = useState(false);

  const inputClass = adminLegacyInput;
  const selectClass = adminLegacyInput;

  function clearField(field: keyof AdminUserFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setError(null);

    const validated = validateAdminUserUpdate({
      displayName,
      email,
      phoneCountryCode,
      phoneNational,
      role,
      isActive,
    });

    if (!validated.ok) {
      setFieldErrors(validated.errors);
      setError(validated.message);
      return;
    }

    setFieldErrors({});
    setPending(true);
    try {
      const res = await fetch(`/api/admin/deployments/admin-users/${user.id}`, {
        method: "PATCH",
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
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }

      const updatedName = displayName.trim() || email.trim();
      toast.success(
        "Changes saved successfully",
        updatedName ? `${updatedName}'s details have been updated.` : "Admin user details have been updated.",
      );
      router.push("/admin/deployments/admin-users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminEditPageHeader
        title="Edit admin user"
        subtitle={user.displayName?.trim() || user.email}
        backHref="/admin/deployments/admin-users"
      />

      {error ? <p className="mt-4 ds-admin-error-banner">{error}</p> : null}

      <div className={`${adminPanel} mt-6`}>
        <h2 className={adminSectionTitle}>User details</h2>
        <p className="mt-1 text-sm text-[var(--ds-body)]">Add a user with name, mobile number, and email.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className={adminFormStack} noValidate>
          <label className={adminLabel}>
            Name
            <input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                clearField("displayName");
              }}
              disabled={!canEdit}
              placeholder="Full name"
              className={fieldClass(inputClass, Boolean(fieldErrors.displayName))}
              aria-invalid={Boolean(fieldErrors.displayName) || undefined}
            />
            <AdminFieldError message={fieldErrors.displayName} />
          </label>

          <AdminPhoneField
            idBase="admin-user-edit"
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
            disabled={!canEdit}
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
              disabled={!canEdit}
              placeholder="admin@example.com"
              className={fieldClass(inputClass, Boolean(fieldErrors.email))}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
              className={adminCheckbox}
            />
            Active
          </label>

          <div className="pt-2">
            {canEdit ? (
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            ) : (
              <p className={adminLabel}>You have read-only access to admin users.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
