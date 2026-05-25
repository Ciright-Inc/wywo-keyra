"use client";

import { AdminFormField } from "@/components/admin/AdminFormField";
import {
  adminCheckbox,
  adminFormCheckboxLabel,
  adminFormInput,
} from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";

export type FooterLinkFormValues = {
  label: string;
  href: string;
  description: string;
  internalPath: string;
  isExternal: boolean;
  sortOrder: string;
  isPublished: boolean;
};

export function emptyFooterLinkFormValues(): FooterLinkFormValues {
  return {
    label: "",
    href: "",
    description: "",
    internalPath: "",
    isExternal: false,
    sortOrder: "100",
    isPublished: true,
  };
}

export function footerLinkFormValuesFromRow(row: {
  label: string;
  href: string;
  description: string | null;
  internalPath: string | null;
  isExternal: boolean;
  sortOrder: number;
  isPublished: boolean;
}): FooterLinkFormValues {
  return {
    label: row.label,
    href: row.href,
    description: row.description ?? "",
    internalPath: row.internalPath ?? "",
    isExternal: row.isExternal,
    sortOrder: String(row.sortOrder),
    isPublished: row.isPublished,
  };
}

type Props = {
  values: FooterLinkFormValues;
  disabled?: boolean;
  className?: string;
  onChange: (patch: Partial<FooterLinkFormValues>) => void;
};

export function FooterLinkFormFields({ values, disabled = false, className, onChange }: Props) {
  const inputClass = adminFormInput;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <AdminFormField label="Label" htmlFor="footer-link-label" required>
        <input
          id="footer-link-label"
          className={inputClass}
          value={values.label}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="Sort order" htmlFor="footer-link-sort">
        <input
          id="footer-link-sort"
          className={inputClass}
          inputMode="numeric"
          value={values.sortOrder}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ sortOrder: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="Href" htmlFor="footer-link-href" required className="sm:col-span-2">
        <input
          id="footer-link-href"
          className={inputClass}
          value={values.href}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ href: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="Internal path" htmlFor="footer-link-internal-path" className="sm:col-span-2">
        <input
          id="footer-link-internal-path"
          className={inputClass}
          value={values.internalPath}
          disabled={disabled}
          placeholder="/trust"
          autoComplete="off"
          onChange={(event) => onChange({ internalPath: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="Description" htmlFor="footer-link-description" className="sm:col-span-2">
        <input
          id="footer-link-description"
          className={inputClass}
          value={values.description}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </AdminFormField>

      <div className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
        <label className={adminFormCheckboxLabel}>
          <input
            type="checkbox"
            className={adminCheckbox}
            checked={values.isExternal}
            disabled={disabled}
            onChange={(event) => onChange({ isExternal: event.target.checked })}
          />
          Open as external link
        </label>
        <label className={adminFormCheckboxLabel}>
          <input
            type="checkbox"
            className={adminCheckbox}
            checked={values.isPublished}
            disabled={disabled}
            onChange={(event) => onChange({ isPublished: event.target.checked })}
          />
          Published
        </label>
      </div>
    </div>
  );
}
