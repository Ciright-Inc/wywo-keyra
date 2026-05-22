"use client";

import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { SAT_PROTOCOL_CATEGORIES } from "@/lib/satProtocol/categories";
import type { ProtocolFormValues } from "@/lib/authenticationFeed/protocolFormValidation";

const inputBase =
  "h-10 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60";

const COLOR_THEMES = [
  "sky",
  "emerald",
  "violet",
  "amber",
  "cyan",
  "slate",
  "fuchsia",
  "indigo",
  "teal",
  "stone",
  "lime",
  "blue",
  "orange",
  "rose",
  "neutral",
  "yellow",
  "purple",
  "red",
  "zinc",
  "green",
] as const;

const SECURITY_CLASSIFICATIONS = ["STANDARD", "ELEVATED", "HIGH", "CRITICAL", "SOVEREIGN"] as const;

type Props = {
  values: ProtocolFormValues;
  errors: Record<string, string>;
  disabled?: boolean;
  onChange: (patch: Partial<ProtocolFormValues>) => void;
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

function CheckboxField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-keyra-primary">
      <input
        type="checkbox"
        className="size-4 accent-keyra-accent"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export function AuthenticationProtocolFormFields({ values, errors, disabled, onChange }: Props) {
  const selectClass = `${inputBase} bg-keyra-bg`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Name" htmlFor="sat-protocol-name" required error={errors.protocolName}>
        <input
          id="sat-protocol-name"
          className={fieldClass(inputBase, Boolean(errors.protocolName))}
          value={values.protocolName}
          onChange={(event) => onChange({ protocolName: event.target.value })}
          disabled={disabled}
          autoComplete="off"
        />
      </Field>

      <Field label="Code" htmlFor="sat-protocol-code" required error={errors.protocolCode}>
        <input
          id="sat-protocol-code"
          className={fieldClass(`${inputBase} uppercase font-mono`, Boolean(errors.protocolCode))}
          value={values.protocolCode}
          onChange={(event) => onChange({ protocolCode: event.target.value.toUpperCase() })}
          disabled={disabled}
          placeholder="SAT-ID"
          autoComplete="off"
        />
      </Field>

      <Field label="Category" htmlFor="sat-protocol-category" required error={errors.protocolCategory}>
        <select
          id="sat-protocol-category"
          className={fieldClass(selectClass, Boolean(errors.protocolCategory))}
          value={values.protocolCategory}
          onChange={(event) => onChange({ protocolCategory: event.target.value })}
          disabled={disabled}
        >
          {SAT_PROTOCOL_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Weight" htmlFor="sat-protocol-weight" required error={errors.percentageWeight}>
        <input
          id="sat-protocol-weight"
          type="number"
          min={0.01}
          step="any"
          className={fieldClass(inputBase, Boolean(errors.percentageWeight))}
          value={values.percentageWeight}
          onChange={(event) => onChange({ percentageWeight: Number(event.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field label="Home %" htmlFor="sat-protocol-home" required error={errors.homePercentage}>
        <input
          id="sat-protocol-home"
          type="number"
          step="any"
          className={fieldClass(inputBase, Boolean(errors.homePercentage))}
          value={values.homePercentage}
          onChange={(event) => onChange({ homePercentage: Number(event.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field label="Roam %" htmlFor="sat-protocol-roam" required error={errors.roamingPercentage}>
        <input
          id="sat-protocol-roam"
          type="number"
          step="any"
          className={fieldClass(inputBase, Boolean(errors.roamingPercentage))}
          value={values.roamingPercentage}
          onChange={(event) => onChange({ roamingPercentage: Number(event.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field label="Trust" htmlFor="sat-protocol-trust" required error={errors.trustLevel}>
        <input
          id="sat-protocol-trust"
          type="number"
          min={1}
          max={5}
          step={1}
          className={fieldClass(inputBase, Boolean(errors.trustLevel))}
          value={values.trustLevel}
          onChange={(event) => onChange({ trustLevel: Number(event.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field label="Security class" htmlFor="sat-protocol-security" error={errors.securityClassification}>
        <select
          id="sat-protocol-security"
          className={fieldClass(selectClass, Boolean(errors.securityClassification))}
          value={values.securityClassification}
          onChange={(event) => onChange({ securityClassification: event.target.value })}
          disabled={disabled}
        >
          {SECURITY_CLASSIFICATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Color theme" htmlFor="sat-protocol-theme" error={errors.colorTheme}>
        <select
          id="sat-protocol-theme"
          className={fieldClass(selectClass, Boolean(errors.colorTheme))}
          value={values.colorTheme}
          onChange={(event) => onChange({ colorTheme: event.target.value })}
          disabled={disabled}
        >
          {COLOR_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Icon key" htmlFor="sat-protocol-icon" error={errors.iconKey}>
        <input
          id="sat-protocol-icon"
          className={fieldClass(inputBase, Boolean(errors.iconKey))}
          value={values.iconKey}
          onChange={(event) => onChange({ iconKey: event.target.value })}
          disabled={disabled}
          placeholder="sat-core-id"
          autoComplete="off"
        />
      </Field>

      <div className="flex flex-col justify-end gap-3 sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wider text-keyra-text-2">Audience flags</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <CheckboxField label="Enterprise" checked={values.flagEnterprise} disabled={disabled} onChange={(checked) => onChange({ flagEnterprise: checked })} />
          <CheckboxField label="Government" checked={values.flagGovernment} disabled={disabled} onChange={(checked) => onChange({ flagGovernment: checked })} />
          <CheckboxField label="Telco" checked={values.flagTelco} disabled={disabled} onChange={(checked) => onChange({ flagTelco: checked })} />
          <CheckboxField label="Consumer" checked={values.flagConsumer} disabled={disabled} onChange={(checked) => onChange({ flagConsumer: checked })} />
          <CheckboxField label="AI agent" checked={values.flagAiAgent} disabled={disabled} onChange={(checked) => onChange({ flagAiAgent: checked })} />
        </div>
      </div>

      <div className="flex flex-col justify-end gap-3 sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wider text-keyra-text-2">Capabilities</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <CheckboxField label="Zero knowledge" checked={values.zeroKnowledgeCompatible} disabled={disabled} onChange={(checked) => onChange({ zeroKnowledgeCompatible: checked })} />
          <CheckboxField label="SIM / eSIM required" checked={values.simOrEsimRequired} disabled={disabled} onChange={(checked) => onChange({ simOrEsimRequired: checked })} />
          <CheckboxField label="Global availability" checked={values.globalAvailability} disabled={disabled} onChange={(checked) => onChange({ globalAvailability: checked })} />
          <CheckboxField label="API ready" checked={values.apiReady} disabled={disabled} onChange={(checked) => onChange({ apiReady: checked })} />
          <CheckboxField label="Active" checked={values.active} disabled={disabled} onChange={(checked) => onChange({ active: checked })} />
        </div>
      </div>
    </div>
  );
}
