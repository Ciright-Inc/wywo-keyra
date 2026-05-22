"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeploymentAdminRole } from "@prisma/client";
import { AdminPhoneField } from "@/components/admin/AdminPhoneField";
import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  type AdminUserFieldErrors,
  validateAdminUserUpdate,
} from "@/lib/adminUserValidation";

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

  const inputClass =
    "mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary disabled:opacity-60";
  const selectClass = inputClass;

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
      const body: Record<string, unknown> = {
        displayName,
        email,
        phoneCountryCode,
        phoneNational,
        role,
        isActive,
      };

      const res = await fetch(`/api/admin/deployments/admin-users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-keyra-primary">Admin user</h1>
          <p className="mt-2 text-sm text-keyra-text-2">{user.displayName?.trim() || user.email}</p>
        </div>
        <Link
          href="/admin/deployments/admin-users"
          className="text-sm text-keyra-accent underline-offset-4 hover:underline"
        >
          Back to list
        </Link>
      </div>

      {error ? <p className="mt-4 ds-admin-error-banner">{error}</p> : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 keyra-card space-y-3 p-6" noValidate>
        <label className="block text-sm text-keyra-text-2">
          Name
          <input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              clearField("displayName");
            }}
            disabled={!canEdit}
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

        <label className="block text-sm text-keyra-text-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearField("email");
            }}
            disabled={!canEdit}
            className={fieldClass(inputClass, Boolean(fieldErrors.email))}
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

        <label className="flex items-center gap-3 text-sm text-keyra-text-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={!canEdit}
            className="size-4 rounded border-keyra-border accent-keyra-primary disabled:opacity-60"
          />
          Active
        </label>

        {canEdit ? (
          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-keyra-text-2">You have read-only access to admin users.</p>
        )}
      </form>
    </div>
  );
}
