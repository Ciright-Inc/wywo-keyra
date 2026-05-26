"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_OPTIONS,
  combinePhoneParts,
  dialForPhoneCountryCode,
} from "@/lib/phoneCountryOptions";
import { WywoCountryCodeSelect } from "./WywoCountryCodeSelect";

type Props = {
  /** Combined E.164 value (e.g. "+353 87 555 0100"). */
  value: string;
  /** Called with combined E.164 string ("" when national is empty). */
  onChange: (next: string) => void;
  /** Defaults to "IE". */
  defaultCountryCode?: string;
  placeholder?: string;
  required?: boolean;
  /** Input HTML name for forms (the country select uses `${name}Country`). */
  name?: string;
  id?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Override the country picker width (Tailwind class). Defaults to compact 112px. */
  countryWidthClass?: string;
};

/**
 * Detect an existing E.164 number and split it into ISO country + national digits.
 * Returns null when no match is found.
 */
function splitE164(e164: string): { code: string; national: string } | null {
  const trimmed = e164.trim();
  if (!trimmed.startsWith("+")) return null;
  const sorted = [...PHONE_COUNTRY_OPTIONS].sort(
    (a, b) => b.dial.length - a.dial.length,
  );
  for (const opt of sorted) {
    if (trimmed.startsWith(opt.dial)) {
      return { code: opt.code, national: trimmed.slice(opt.dial.length).trim() };
    }
  }
  return null;
}

/**
 * WYWO phone input: country select + national digits, emits combined E.164 via onChange.
 * Re-uses Keyra `ds-text-input is-sm` styling so it lines up with the rest of the admin UI.
 */
export function WywoPhoneField({
  value,
  onChange,
  defaultCountryCode = DEFAULT_PHONE_COUNTRY_CODE,
  placeholder = "87 555 0100",
  required,
  name = "phone",
  id,
  autoFocus,
  disabled,
  countryWidthClass = "w-[112px]",
}: Props) {
  const initial = useMemo(() => {
    const parsed = value ? splitE164(value) : null;
    if (parsed) return parsed;
    return {
      code: defaultCountryCode,
      national: value && !value.startsWith("+") ? value : "",
    };
  }, [value, defaultCountryCode]);

  const [country, setCountry] = useState<string>(initial.code);
  const [national, setNational] = useState<string>(initial.national);

  useEffect(() => {
    if (!value) {
      setNational("");
      return;
    }
    const parsed = splitE164(value);
    if (parsed) {
      setCountry(parsed.code);
      setNational(parsed.national);
    }
  }, [value]);

  function emit(nextCountry: string, nextNational: string) {
    const combined = combinePhoneParts(
      dialForPhoneCountryCode(nextCountry),
      nextNational,
    );
    onChange(combined);
  }

  return (
    <div className="flex w-full min-w-0 items-stretch gap-2">
      <WywoCountryCodeSelect
        value={country}
        widthClass={countryWidthClass}
        disabled={disabled}
        name={`${name}Country`}
        onChange={(next) => {
          setCountry(next);
          emit(next, national);
        }}
      />
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="ds-text-input is-sm min-w-0 flex-1"
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        disabled={disabled}
        value={national}
        onChange={(e) => {
          const next = e.target.value;
          setNational(next);
          emit(country, next);
        }}
      />
    </div>
  );
}
