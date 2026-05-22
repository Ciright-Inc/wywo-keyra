"use client";

import { PhoneCountryCombo } from "@/components/admin/PhoneCountryCombo";
import { AdminFieldError, fieldClass } from "@/components/admin/AdminFieldError";
import { phoneNationalPlaceholder } from "@/lib/phoneNationalPlaceholder";

type Props = {
  idBase: string;
  label: string;
  phoneCountryCode: string;
  nationalValue: string;
  onPhoneCountryChange: (isoCode: string) => void;
  onNationalChange: (n: string) => void;
  disabled?: boolean;
  required?: boolean;
  phoneError?: string;
  countryError?: string;
};

export function AdminPhoneField({
  idBase,
  label,
  phoneCountryCode,
  nationalValue,
  onPhoneCountryChange,
  onNationalChange,
  disabled = false,
  required = false,
  phoneError,
  countryError,
}: Props) {
  const hasError = Boolean(phoneError || countryError);
  const inputClass = fieldClass(
    "mt-1 h-10 w-full rounded-lg border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary shadow-sm outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60",
    hasError,
  );

  return (
    <div>
      <p className="text-sm text-keyra-text-2">
        {label}
        {required ? <span className="text-keyra-text-2/80"> *</span> : null}
      </p>
      <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)]">
        <div>
          <PhoneCountryCombo
            id={`${idBase}-dial`}
            value={phoneCountryCode}
            onChange={onPhoneCountryChange}
            disabled={disabled}
            required={required}
            className={countryError ? "rounded-lg ring-1 ring-red-500/20" : ""}
          />
          <AdminFieldError message={countryError} />
        </div>
        <div>
          <input
            id={`${idBase}-national`}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            className={inputClass}
            value={nationalValue}
            disabled={disabled}
            required={required}
            placeholder={phoneNationalPlaceholder(phoneCountryCode)}
            aria-invalid={hasError || undefined}
            onChange={(e) => onNationalChange(e.target.value.replace(/[^\d\s()-]/g, ""))}
          />
          <AdminFieldError message={phoneError} />
        </div>
      </div>
    </div>
  );
}
