"use client";

import { AdminFormField } from "@/components/admin/AdminFormField";
import {
  adminCheckbox,
  adminFormCheckboxLabel,
  adminFormInput,
} from "@/lib/admin/adminUiClasses";
import type { SiteFooterSocialLinkView, SiteSocialPlatform } from "@/lib/siteFooter/types";
import { cn } from "@/components/ui/cn";
import { SocialPlatformPicker } from "./SocialPlatformPicker";

export type FooterSocialFormValues = {
  platform: SiteSocialPlatform;
  label: string;
  url: string;
  sortOrder: string;
  isPublished: boolean;
};

export function emptyFooterSocialFormValues(): FooterSocialFormValues {
  return {
    platform: "LINKEDIN",
    label: "",
    url: "",
    sortOrder: "100",
    isPublished: true,
  };
}

export function footerSocialFormValuesFromRow(row: SiteFooterSocialLinkView): FooterSocialFormValues {
  return {
    platform: row.platform,
    label: row.label,
    url: row.url,
    sortOrder: String(row.sortOrder),
    isPublished: row.isPublished,
  };
}

type Props = {
  values: FooterSocialFormValues;
  disabled?: boolean;
  className?: string;
  onChange: (patch: Partial<FooterSocialFormValues>) => void;
};

export function FooterSocialFormFields({ values, disabled = false, className, onChange }: Props) {
  const inputClass = adminFormInput;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <AdminFormField label="Platform" className="sm:col-span-2">
        <SocialPlatformPicker
          value={values.platform}
          disabled={disabled}
          onChange={(platform) => onChange({ platform })}
        />
      </AdminFormField>

      <AdminFormField label="Label" htmlFor="footer-social-label" required>
        <input
          id="footer-social-label"
          className={inputClass}
          value={values.label}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="Sort order" htmlFor="footer-social-sort">
        <input
          id="footer-social-sort"
          className={inputClass}
          inputMode="numeric"
          value={values.sortOrder}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ sortOrder: event.target.value })}
        />
      </AdminFormField>

      <AdminFormField label="URL" htmlFor="footer-social-url" required className="sm:col-span-2">
        <input
          id="footer-social-url"
          className={inputClass}
          value={values.url}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ url: event.target.value })}
        />
      </AdminFormField>

      <div className="sm:col-span-2">
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
