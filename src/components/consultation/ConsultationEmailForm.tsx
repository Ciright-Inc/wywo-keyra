"use client";

import { CONSULTATION_ORG_TYPES } from "@/lib/consultation/constants";
import { COUNTRY_ISO_OPTIONS } from "@/lib/countryIsoOptions";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_OPTIONS,
  combinePhoneParts,
  dialForPhoneCountryCode,
} from "@/lib/phoneCountryOptions";
import { FormHoneypot } from "@/components/registration/registrationPrimitives";
import { TurnstileMount } from "@/components/registration/registrationPrimitives";
import { useToast } from "@/components/ui/Toast";
import {
  ConsultFieldError,
  ConsultSectionTitle,
  TopicCheckboxGrid,
  consultField,
  consultFieldErr,
  consultLabel,
} from "@/components/consultation/consultationFormPrimitives";
import { type FormEvent, useState } from "react";

type Props = {
  onBack: () => void;
};

export function ConsultationEmailForm({ onBack }: Props) {
  const { success, error } = useToast();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  function fieldClass(key: string, extra = "") {
    return `${consultField} ${fieldErrors[key] ? consultFieldErr : ""} ${extra}`;
  }

  function clearError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setFieldErrors({});
    setPending(true);

    const phoneCountry = String(fd.get("phoneCountry") ?? DEFAULT_PHONE_COUNTRY_CODE);
    const phoneNational = String(fd.get("phoneNational") ?? "");
    const phone = combinePhoneParts(
      dialForPhoneCountryCode(phoneCountry),
      phoneNational,
    );

    const payload = {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      company: String(fd.get("company") ?? ""),
      title: String(fd.get("title") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone,
      country: String(fd.get("country") ?? ""),
      website: String(fd.get("website") ?? ""),
      organizationType: String(fd.get("organizationType") ?? ""),
      topics,
      message: String(fd.get("message") ?? ""),
      _honeypot: honeypot,
      turnstileToken,
    };

    try {
      const res = await fetch("/api/consultation/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        errors?: Record<string, string>;
        error?: string;
      };

      if (!res.ok) {
        if (json.errors) {
          setFieldErrors(json.errors);
          error("Please check the form", "Some fields need attention.");
          return;
        }
        error("Submission failed", json.error ?? "Please try again.");
        return;
      }

      success("Request received", "A Keyra advisor will review your submission.");
      setDone(true);
      form.reset();
      setTopics([]);
      setTurnstileReset((n) => n + 1);
    } catch {
      error("Network error", "Could not submit. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-keyra-border/20 bg-keyra-surface p-8 text-center sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-keyra-muted">
          Confirmation
        </p>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-keyra-primary">
          Thank you.
        </h3>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-keyra-muted">
          Your consultation request has been received. A Keyra advisor will
          review your submission and respond with the appropriate next step.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            onBack();
          }}
          className="mt-8 text-sm font-medium text-keyra-text underline-offset-4 hover:underline"
        >
          Return to consultation options
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <FormHoneypot value={honeypot} onChange={setHoneypot} />

      <div className="flex items-center justify-between gap-4 border-b border-keyra-border/15 pb-4">
        <ConsultSectionTitle sub="Structured intake via contact.keyra.ie">
          Send Consultation Request
        </ConsultSectionTitle>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 text-sm font-medium text-keyra-muted hover:text-keyra-primary"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={consultLabel}>
            First Name <span className="opacity-60">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            className={fieldClass("firstName")}
            onChange={() => clearError("firstName")}
          />
          {fieldErrors.firstName ? (
            <ConsultFieldError id="firstName-error" text={fieldErrors.firstName} />
          ) : null}
        </div>
        <div>
          <label htmlFor="lastName" className={consultLabel}>
            Last Name <span className="opacity-60">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            className={fieldClass("lastName")}
            onChange={() => clearError("lastName")}
          />
          {fieldErrors.lastName ? (
            <ConsultFieldError id="lastName-error" text={fieldErrors.lastName} />
          ) : null}
        </div>
        <div>
          <label htmlFor="company" className={consultLabel}>
            Company <span className="opacity-60">*</span>
          </label>
          <input
            id="company"
            name="company"
            className={fieldClass("company")}
            onChange={() => clearError("company")}
          />
          {fieldErrors.company ? (
            <ConsultFieldError id="company-error" text={fieldErrors.company} />
          ) : null}
        </div>
        <div>
          <label htmlFor="title" className={consultLabel}>
            Title <span className="opacity-60">*</span>
          </label>
          <input
            id="title"
            name="title"
            className={fieldClass("title")}
            onChange={() => clearError("title")}
          />
          {fieldErrors.title ? (
            <ConsultFieldError id="title-error" text={fieldErrors.title} />
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className={consultLabel}>
            Email <span className="opacity-60">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={fieldClass("email")}
            onChange={() => clearError("email")}
          />
          {fieldErrors.email ? (
            <ConsultFieldError id="email-error" text={fieldErrors.email} />
          ) : null}
        </div>
        <div>
          <span id="phone-label" className={consultLabel}>
            Mobile Phone <span className="opacity-60">*</span>
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              name="phoneCountry"
              defaultValue={DEFAULT_PHONE_COUNTRY_CODE}
              className={`${fieldClass("phone")} sm:w-36`}
              onChange={() => clearError("phone")}
            >
              {PHONE_COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>
            <input
              name="phoneNational"
              type="tel"
              className={fieldClass("phone", "min-w-0 flex-1")}
              onChange={() => clearError("phone")}
            />
          </div>
          {fieldErrors.phone ? (
            <ConsultFieldError id="phone-error" text={fieldErrors.phone} />
          ) : null}
        </div>
        <div>
          <label htmlFor="country" className={consultLabel}>
            Country <span className="opacity-60">*</span>
          </label>
          <select
            id="country"
            name="country"
            defaultValue=""
            className={fieldClass("country")}
            onChange={() => clearError("country")}
          >
            <option value="" disabled>
              Select country
            </option>
            {COUNTRY_ISO_OPTIONS.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.country ? (
            <ConsultFieldError id="country-error" text={fieldErrors.country} />
          ) : null}
        </div>
        <div>
          <label htmlFor="website" className={consultLabel}>
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
            className={fieldClass("website")}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="organizationType" className={consultLabel}>
            Organization Type <span className="opacity-60">*</span>
          </label>
          <select
            id="organizationType"
            name="organizationType"
            defaultValue=""
            className={fieldClass("organizationType")}
            onChange={() => clearError("organizationType")}
          >
            <option value="" disabled>
              Select organization type
            </option>
            {CONSULTATION_ORG_TYPES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {fieldErrors.organizationType ? (
            <ConsultFieldError
              id="organizationType-error"
              text={fieldErrors.organizationType}
            />
          ) : null}
        </div>
      </div>

      <div>
        <label className={consultLabel}>
          Consultation Topic <span className="opacity-60">*</span>
        </label>
        <TopicCheckboxGrid
          selected={topics}
          onChange={(t) => {
            setTopics(t);
            clearError("topics");
          }}
          error={fieldErrors.topics}
        />
      </div>

      <div>
        <label htmlFor="message" className={consultLabel}>
          Tell us what you would like to discuss.{" "}
          <span className="opacity-60">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Briefly describe your organization, current challenge, deployment objective, or strategic interest."
          className={fieldClass("message", "resize-y")}
          onChange={() => clearError("message")}
        />
        {fieldErrors.message ? (
          <ConsultFieldError id="message-error" text={fieldErrors.message} />
        ) : null}
      </div>

      <TurnstileMount resetSignal={turnstileReset} onToken={setTurnstileToken} />

      <div className="flex flex-col gap-4 border-t border-keyra-border/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-keyra-muted">
          Source: consult.keyra.ie · Email Consultation Request
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex justify-center rounded-full border border-keyra-text bg-keyra-text px-8 py-3 text-sm font-semibold text-keyra-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit Consultation Request"}
        </button>
      </div>
    </form>
  );
}
