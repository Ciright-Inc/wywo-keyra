"use client";

import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { CountryFlagCombo } from "@/components/admin/CountryFlagCombo";
import type { AuthCountryFormValues } from "@/lib/authenticationFeed/countryFormValidation";
import { authCountryFieldsFromFlagOption } from "@/lib/countryFlagOptions";

const inputBase =
  "h-10 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60";

type Props = {
  values: AuthCountryFormValues;
  errors: Record<string, string>;
  disabled?: boolean;
  flagFirst?: boolean;
  onChange: (patch: Partial<AuthCountryFormValues>) => void;
};

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-xs font-medium text-keyra-text-2">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      <AdminFieldError message={error} />
    </label>
  );
}

export function AuthenticationCountryFormFields({
  values,
  errors,
  disabled,
  flagFirst = false,
  onChange,
}: Props) {
  const flagField = (
    <Field label="Flag" htmlFor="auth-country-flag" error={errors.flagEmoji}>
      <CountryFlagCombo
        id="auth-country-flag"
        flagEmoji={values.flagEmoji}
        iso2={values.iso2}
        disabled={disabled}
        hasError={Boolean(errors.flagEmoji)}
        onChange={(nextFlag) => onChange({ flagEmoji: nextFlag })}
        onCountrySelect={(option) => onChange(authCountryFieldsFromFlagOption(option))}
      />
    </Field>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {flagFirst ? flagField : null}

      <Field label="Name" htmlFor="auth-country-name" required error={errors.countryName}>
        <input
          id="auth-country-name"
          className={fieldClass(inputBase, Boolean(errors.countryName))}
          value={values.countryName}
          onChange={(e) => onChange({ countryName: e.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      <Field label="Official name" htmlFor="auth-country-official" error={errors.officialName}>
        <input
          id="auth-country-official"
          className={fieldClass(inputBase, Boolean(errors.officialName))}
          value={values.officialName}
          onChange={(e) => onChange({ officialName: e.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      {!flagFirst ? flagField : null}

      <Field label="ISO-2" htmlFor="auth-country-iso2" required error={errors.iso2}>
        <input
          id="auth-country-iso2"
          className={fieldClass(`${inputBase} uppercase`, Boolean(errors.iso2))}
          value={values.iso2}
          onChange={(e) => onChange({ iso2: e.target.value.toUpperCase().slice(0, 2) })}
          disabled={disabled}
          maxLength={2}
          autoComplete="off"
        />
      </Field>

      <Field label="ISO-3" htmlFor="auth-country-iso3" error={errors.iso3}>
        <input
          id="auth-country-iso3"
          className={fieldClass(`${inputBase} uppercase`, Boolean(errors.iso3))}
          value={values.iso3}
          onChange={(e) => onChange({ iso3: e.target.value.toUpperCase().slice(0, 3) })}
          disabled={disabled}
          maxLength={3}
          autoComplete="off"
        />
      </Field>

      <Field label="Region" htmlFor="auth-country-region" required error={errors.region}>
        <input
          id="auth-country-region"
          className={fieldClass(inputBase, Boolean(errors.region))}
          value={values.region}
          onChange={(e) => onChange({ region: e.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      <Field label="Sub-region" htmlFor="auth-country-subregion" error={errors.subRegion}>
        <input
          id="auth-country-subregion"
          className={fieldClass(inputBase, Boolean(errors.subRegion))}
          value={values.subRegion}
          onChange={(e) => onChange({ subRegion: e.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      <Field label="Phone" htmlFor="auth-country-phone" error={errors.phoneCountryCode}>
        <input
          id="auth-country-phone"
          className={fieldClass(inputBase, Boolean(errors.phoneCountryCode))}
          value={values.phoneCountryCode}
          onChange={(e) => onChange({ phoneCountryCode: e.target.value })}
          disabled={disabled}
          placeholder="+353"
          autoComplete="off"
        />
      </Field>

      <Field label="Currency code" htmlFor="auth-country-currency-code" error={errors.currencyCode}>
        <input
          id="auth-country-currency-code"
          className={fieldClass(`${inputBase} uppercase`, Boolean(errors.currencyCode))}
          value={values.currencyCode}
          onChange={(e) => onChange({ currencyCode: e.target.value.toUpperCase().slice(0, 3) })}
          disabled={disabled}
          placeholder="EUR"
          maxLength={3}
          autoComplete="off"
        />
      </Field>

      <Field label="Currency name" htmlFor="auth-country-currency-name" error={errors.currencyName}>
        <input
          id="auth-country-currency-name"
          className={fieldClass(inputBase, Boolean(errors.currencyName))}
          value={values.currencyName}
          onChange={(e) => onChange({ currencyName: e.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      <Field label="Weight" htmlFor="auth-country-weight" required error={errors.percentageWeight}>
        <input
          id="auth-country-weight"
          type="number"
          min={0.01}
          step="any"
          className={fieldClass(inputBase, Boolean(errors.percentageWeight))}
          value={values.percentageWeight}
          onChange={(e) => onChange({ percentageWeight: Number(e.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field label="Priority" htmlFor="auth-country-priority" error={errors.displayPriority}>
        <input
          id="auth-country-priority"
          type="number"
          step={1}
          className={fieldClass(inputBase, Boolean(errors.displayPriority))}
          value={values.displayPriority}
          onChange={(e) => onChange({ displayPriority: Math.floor(Number(e.target.value)) || 0 })}
          disabled={disabled}
        />
      </Field>

      <div className="flex flex-col justify-end gap-3 sm:col-span-2 lg:col-span-3">
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-keyra-primary">
            <input
              type="checkbox"
              className="size-4 accent-keyra-accent"
              checked={values.authenticationEnabled}
              onChange={(e) => onChange({ authenticationEnabled: e.target.checked })}
              disabled={disabled}
            />
            Auth feed enabled
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-keyra-primary">
            <input
              type="checkbox"
              className="size-4 accent-keyra-accent"
              checked={values.active}
              onChange={(e) => onChange({ active: e.target.checked })}
              disabled={disabled}
            />
            Active
          </label>
        </div>
      </div>
    </div>
  );
}
