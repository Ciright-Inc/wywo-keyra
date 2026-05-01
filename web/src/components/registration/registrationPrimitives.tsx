"use client";

import { PHONE_COUNTRY_OPTIONS } from "@/lib/phoneCountryOptions";
import { COUNTRY_ISO_OPTIONS } from "@/lib/countryIsoOptions";
import {
  type FormEventHandler,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cn } from "@/components/ui/cn";

export const regField =
  "w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-4 py-3.5 text-[16px] text-keyra-text placeholder:text-keyra-text-2/60 transition duration-200 focus-visible:outline-none focus-visible:keyra-focus";

export const regLabel = "mb-2 block text-[14px] font-medium text-keyra-text";

export function FormHoneypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
      <label htmlFor="keyra-hp">Company website</label>
      <input
        id="keyra-hp"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function TurnstileMount({
  resetSignal,
  onToken,
}: {
  /** Increment to re-render widget after submit */
  resetSignal: number;
  onToken: (token: string | null) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hostRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !hostRef.current) return;
    let widgetId: string | undefined;
    const el = hostRef.current;
    el.innerHTML = "";

    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    const start = () => {
      widgetId = window.turnstile?.render(el, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
      });
    };

    if (existing && window.turnstile) {
      start();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = start;
      document.body.appendChild(script);
    }

    return () => {
      if (widgetId && window.turnstile?.remove) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [siteKey, resetSignal]);

  if (!siteKey) return null;
  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-[13px] text-keyra-text-2">Verification</p>
      <div ref={hostRef} className="flex min-h-[65px] justify-center" />
    </div>
  );
}

export function CountrySelect({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={regLabel}>
        {label}
        {required ? <span className="text-keyra-text-2"> *</span> : null}
      </label>
      <select
        id={id}
        required={required}
        className={regField}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select country</option>
        {COUNTRY_ISO_OPTIONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PhoneInternationalRow({
  idBase,
  label,
  dialValue,
  nationalValue,
  onDialChange,
  onNationalChange,
  hint,
}: {
  idBase: string;
  label: string;
  dialValue: string;
  nationalValue: string;
  onDialChange: (d: string) => void;
  onNationalChange: (n: string) => void;
  hint?: ReactNode;
}) {
  return (
    <div>
      <p className={regLabel}>{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
        <select
          id={`${idBase}-dial`}
          className={regField}
          value={dialValue}
          onChange={(e) => onDialChange(e.target.value)}
          aria-label="Country calling code"
        >
          {PHONE_COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.dial} {c.name}
            </option>
          ))}
        </select>
        <input
          id={`${idBase}-national`}
          className={regField}
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="National mobile number"
          value={nationalValue}
          onChange={(e) => onNationalChange(e.target.value)}
        />
      </div>
      {hint ? (
        <p className="mt-2 text-[13px] leading-relaxed text-keyra-text-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function RegistrationFormShell({
  children,
  onSubmit,
  error,
  id,
}: {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  error: string | null;
  id?: string;
}) {
  return (
    <form id={id} className="relative space-y-5" onSubmit={onSubmit} noValidate>
      {children}
      {error ? (
        <p className="text-[14px] font-medium text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function SuccessPanel({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-6 py-2">
      <p className="text-[16px] leading-relaxed text-keyra-text-2">{message}</p>
      <button
        type="button"
        className={cn(
          regField,
          "cursor-pointer border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] text-center font-semibold",
        )}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
