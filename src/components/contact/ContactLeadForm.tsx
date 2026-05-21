"use client";

import {
  SUBJECT_FALLBACK,
  fetchCirightSubjectsInBrowser,
  submitCirightLeadInBrowser,
  type CirightContactSubject,
} from "@/lib/cirightContactClient";
import {
  type ContactFieldErrors,
  type ContactFieldKey,
  hasFieldErrors,
  validateContactFields,
} from "@/lib/contactFormValidation";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_OPTIONS,
  combinePhoneParts,
  dialForPhoneCountryCode,
} from "@/lib/phoneCountryOptions";
import { useToast } from "@/components/ui/Toast";
import { type FormEvent, useEffect, useState } from "react";

const BORDER_OK =
  "border-keyra-border focus-visible:border-keyra-text focus-visible:ring-2 focus-visible:ring-keyra-text/15";
const BORDER_ERR =
  "border-black/40 focus-visible:border-keyra-text focus-visible:ring-2 focus-visible:ring-black/12";

function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-keyra-text" role="alert">
      {text}
    </p>
  );
}

export function ContactLeadForm() {
  const { success, error } = useToast();
  const [subjects, setSubjects] = useState<CirightContactSubject[]>([]);
  const [subjectsReady, setSubjectsReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromApi = await fetchCirightSubjectsInBrowser();
      if (cancelled) return;
      setSubjects(fromApi.length > 0 ? fromApi : SUBJECT_FALLBACK);
      setSubjectsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function clearFieldError(key: ContactFieldKey) {
    setFormError(null);
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function inputClass(key: ContactFieldKey, extra = ""): string {
    const base =
      "w-full rounded-xl border bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70";
    return `${base} ${fieldErrors[key] ? BORDER_ERR : BORDER_OK} ${extra}`;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setFormError(null);
    setFieldErrors({});

    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const description = String(fd.get("message") ?? "");
    const subjectRaw = String(fd.get("subject") ?? "").trim();
    const phoneCountryCode = String(fd.get("phoneCountry") ?? "").trim();
    const national = String(fd.get("phoneNational") ?? "").trim();
    const phoneNationalDigits = national.replace(/\D/g, "");

    const clientErrors = validateContactFields({
      name,
      email,
      phoneNationalDigits,
      hasSubject: Boolean(subjectRaw) && subjectRaw !== "",
      message: description,
    });

    if (hasFieldErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      return;
    }

    const phone = combinePhoneParts(
      dialForPhoneCountryCode(phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE),
      national,
    );

    const subjectSelect = form.querySelector<HTMLSelectElement>("#subject");
    const opt = subjectSelect?.selectedOptions[0];
    const title = opt ? opt.text.trim() : "";

    const subjectId = Number(subjectRaw);
    if (!Number.isFinite(subjectId)) {
      setFieldErrors({ subject: "Please select a valid subject." });
      return;
    }

    setPending(true);

    try {
      const result = await submitCirightLeadInBrowser({
        subjectId,
        title: title || "Contact",
        name: name.trim(),
        email: email.trim(),
        phone,
        description: description.trim(),
      });

      if (!result.ok) {
        error("Could not send message", result.message);
        setFormError(result.message);
        if (result.fieldHints && Object.keys(result.fieldHints).length > 0) {
          setFieldErrors((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(result.fieldHints!)) {
              if (v) next[k as ContactFieldKey] = v;
            }
            return next;
          });
        }
        return;
      }

      success(
        "Message sent",
        "Thanks — your message was sent. We will be in touch soon.",
      );
      form.reset();
      const sel = form.querySelector<HTMLSelectElement>("#phoneCountry");
      if (sel) sel.value = DEFAULT_PHONE_COUNTRY_CODE;
      setFieldErrors({});
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {formError ? (
        <p
          className="rounded-xl border border-keyra-border bg-keyra-surface-2 px-4 py-3 text-sm text-keyra-text"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-keyra-primary"
          >
            Name <span className="text-keyra-text opacity-70">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            onChange={() => clearFieldError("name")}
            className={inputClass("name")}
            placeholder="Your full name"
          />
          {fieldErrors.name ? (
            <FieldError id="name-error" text={fieldErrors.name} />
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-keyra-primary"
          >
            Email <span className="text-keyra-text opacity-70">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            onChange={() => clearFieldError("email")}
            className={inputClass("email")}
            placeholder="you@example.com"
          />
          {fieldErrors.email ? (
            <FieldError id="email-error" text={fieldErrors.email} />
          ) : null}
        </div>

        <div>
          <span
            id="phone-label"
            className="mb-2 block text-sm font-medium text-keyra-primary"
          >
            Phone number
          </span>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row">
            <select
              name="phoneCountry"
              id="phoneCountry"
              defaultValue={DEFAULT_PHONE_COUNTRY_CODE}
              autoComplete="tel-country-code"
              aria-labelledby="phone-label"
              onChange={() => clearFieldError("phone")}
              className={`w-full shrink-0 rounded-xl border bg-keyra-surface py-3 pl-2.5 pr-7 text-sm text-keyra-ink outline-none transition sm:w-36 ${
                fieldErrors.phone ? BORDER_ERR : BORDER_OK
              }`}
            >
              {PHONE_COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>
            <input
              id="phoneNational"
              name="phoneNational"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              aria-labelledby="phone-label"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              onChange={() => clearFieldError("phone")}
              className={`min-w-0 flex-1 rounded-xl border bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 ${
                fieldErrors.phone ? BORDER_ERR : BORDER_OK
              }`}
              placeholder="87 123 4567"
            />
          </div>
          {fieldErrors.phone ? (
            <FieldError id="phone-error" text={fieldErrors.phone} />
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-medium text-keyra-primary"
          >
            Subject <span className="text-keyra-text opacity-70">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.subject)}
            aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
            disabled={!subjectsReady}
            defaultValue=""
            onChange={() => clearFieldError("subject")}
            className={`w-full rounded-xl border bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition disabled:cursor-wait disabled:opacity-70 ${
              fieldErrors.subject ? BORDER_ERR : BORDER_OK
            }`}
          >
            <option value="" disabled>
              {subjectsReady ? "Select a subject" : "Loading subjects…"}
            </option>
            {subjects.map((s) => (
              <option key={s.key} value={String(s.key)}>
                {s.value.trim()}
              </option>
            ))}
          </select>
          {fieldErrors.subject ? (
            <FieldError id="subject-error" text={fieldErrors.subject} />
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-keyra-primary"
          >
            Message <span className="text-keyra-text opacity-70">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message ? "message-error" : undefined
            }
            onChange={() => clearFieldError("message")}
            className={inputClass("message", "resize-y")}
            placeholder="Tell us how we can help..."
          />
          {fieldErrors.message ? (
            <FieldError id="message-error" text={fieldErrors.message} />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-keyra-border/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs text-keyra-muted sm:text-left">
          Prefer email? Contact{" "}
          <a
            href="mailto:hello@keyra.ie"
            className="font-medium text-keyra-text underline-offset-4 hover:underline"
          >
            hello@keyra.ie
          </a>
        </p>
        <button
          type="submit"
          disabled={pending || !subjectsReady}
          className="inline-flex w-full shrink-0 justify-center rounded-full border border-keyra-text bg-keyra-text px-6 py-3 text-sm font-semibold text-keyra-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
