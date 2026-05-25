"use client";

import {
  CONSULTATION_ORG_TYPES,
  CONSULTATION_TYPES,
  consultationTypeById,
} from "@/lib/consultation/constants";
import type { CalendarDayAvailability } from "@/lib/consultation/types";
import { COUNTRY_ISO_OPTIONS } from "@/lib/countryIsoOptions";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_OPTIONS,
  combinePhoneParts,
  dialForPhoneCountryCode,
} from "@/lib/phoneCountryOptions";
import {
  ConsultFieldError,
  ConsultSectionTitle,
  TopicCheckboxGrid,
  consultField,
  consultFieldErr,
  consultLabel,
} from "@/components/consultation/consultationFormPrimitives";
import { FormHoneypot, TurnstileMount } from "@/components/registration/registrationPrimitives";
import { useToast } from "@/components/ui/Toast";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { keyraPlatformAppUrl } from "@/lib/keyraAppUrls";

type Step = "type" | "details" | "calendar" | "confirmed";

type BookResult = {
  meetingUrl: string;
  meetingTitle: string;
  startIso: string;
  endIso: string;
  timezone: string;
  rescheduleUrl?: string;
  cancellationUrl?: string;
};

type Props = {
  onBack: () => void;
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatSlotLabel(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ConsultationSchedulingFlow({ onBack }: Props) {
  const { success, error } = useToast();
  const [step, setStep] = useState<Step>("type");
  const [consultationTypeId, setConsultationTypeId] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [days, setDays] = useState<CalendarDayAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [bookResult, setBookResult] = useState<BookResult | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  const selectedType = consultationTypeById(consultationTypeId);

  useEffect(() => {
    setTimezone(detectTimezone());
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!consultationTypeId) return;
    setLoadingSlots(true);
    try {
      const qs = new URLSearchParams({
        consultationTypeId,
        timezone,
      });
      const res = await fetch(`/api/consultation/calendar/availability?${qs}`);
      const json = (await res.json()) as {
        days?: CalendarDayAvailability[];
        error?: string;
      };
      if (!res.ok) {
        error("Calendar unavailable", json.error ?? "Try again later.");
        return;
      }
      setDays(json.days ?? []);
      if (json.days?.[0]?.date) setSelectedDate(json.days[0].date);
    } catch {
      error("Network error", "Could not load availability.");
    } finally {
      setLoadingSlots(false);
    }
  }, [consultationTypeId, timezone, error]);

  useEffect(() => {
    if (step === "calendar" && consultationTypeId) {
      void loadAvailability();
    }
  }, [step, consultationTypeId, loadAvailability]);

  const slotsForDate = useMemo(() => {
    const day = days.find((d) => d.date === selectedDate);
    return day?.slots.filter((s) => s.available) ?? [];
  }, [days, selectedDate]);

  function fieldClass(key: string) {
    return `${consultField} ${fieldErrors[key] ? consultFieldErr : ""}`;
  }

  function clearError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function onTypeSelect(id: string) {
    setConsultationTypeId(id);
    setStep("details");
  }

  function onDetailsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const next: Record<string, string> = {
      name: String(fd.get("name") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      title: String(fd.get("title") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phoneCountry: String(fd.get("phoneCountry") ?? DEFAULT_PHONE_COUNTRY_CODE),
      phoneNational: String(fd.get("phoneNational") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim(),
      organizationType: String(fd.get("organizationType") ?? "").trim(),
      meetingObjective: String(fd.get("meetingObjective") ?? "").trim(),
    };
    setDetails(next);
    setFieldErrors({});
    if (!next.name || !next.company || !next.email || topics.length === 0) {
      const errs: Record<string, string> = {};
      if (!next.name) errs.name = "Name is required.";
      if (!next.company) errs.company = "Company is required.";
      if (!next.email) errs.email = "Email is required.";
      if (topics.length === 0) errs.topics = "Select at least one topic.";
      setFieldErrors(errs);
      return;
    }
    setStep("calendar");
  }

  async function confirmBooking() {
    if (!selectedSlot) {
      setFieldErrors({ startIso: "Select a time slot." });
      return;
    }

    const phone = combinePhoneParts(
      dialForPhoneCountryCode(details.phoneCountry ?? DEFAULT_PHONE_COUNTRY_CODE),
      details.phoneNational ?? "",
    );

    setPending(true);
    setFieldErrors({});

    try {
      const res = await fetch("/api/consultation/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationTypeId,
          startIso: selectedSlot,
          timezone,
          name: details.name,
          company: details.company,
          title: details.title,
          email: details.email,
          phone,
          country: details.country,
          organizationType: details.organizationType,
          topics,
          meetingObjective: details.meetingObjective,
          _honeypot: honeypot,
          turnstileToken,
        }),
      });

      const json = (await res.json()) as BookResult & {
        ok?: boolean;
        errors?: Record<string, string>;
        error?: string;
      };

      if (!res.ok) {
        if (json.errors) {
          setFieldErrors(json.errors);
          return;
        }
        error("Booking failed", json.error ?? "Please try again.");
        return;
      }

      setBookResult({
        meetingUrl: json.meetingUrl,
        meetingTitle: json.meetingTitle,
        startIso: json.startIso,
        endIso: json.endIso,
        timezone: json.timezone,
        rescheduleUrl: json.rescheduleUrl,
        cancellationUrl: json.cancellationUrl,
      });
      setStep("confirmed");
      success("Consultation confirmed", "Calendar invitation sent.");
      setTurnstileReset((n) => n + 1);
    } catch {
      error("Network error", "Could not complete booking.");
    } finally {
      setPending(false);
    }
  }

  if (step === "confirmed" && bookResult) {
    const when = formatSlotLabel(bookResult.startIso, bookResult.timezone);
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-keyra-border/20 bg-keyra-surface p-8 text-center sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-keyra-muted">
            Confirmed
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-keyra-primary">
            Your Keyra Consultation Is Confirmed
          </h3>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-keyra-muted">
            Your calendar invitation has been sent. A secure video consultation
            link has been created through Keyra Video Experience.
          </p>
          <p className="mt-6 text-sm font-medium text-keyra-primary">
            {bookResult.meetingTitle}
          </p>
          <p className="mt-2 text-sm text-keyra-muted">{when}</p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-keyra-border/25 bg-keyra-bg px-4 py-3 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-keyra-muted">
              Meeting Link
            </p>
            <a
              href={bookResult.meetingUrl}
              className="mt-1 break-all text-sm font-medium text-keyra-text underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {bookResult.meetingUrl}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {bookResult.rescheduleUrl ? (
              <a
                href={bookResult.rescheduleUrl}
                className="rounded-full border border-keyra-border px-5 py-2.5 text-sm font-medium text-keyra-primary transition hover:border-keyra-text/30"
              >
                Reschedule
              </a>
            ) : null}
            {bookResult.cancellationUrl ? (
              <a
                href={bookResult.cancellationUrl}
                className="rounded-full border border-keyra-border px-5 py-2.5 text-sm font-medium text-keyra-muted transition hover:border-keyra-text/30"
              >
                Cancel
              </a>
            ) : null}
            <a
              href={keyraPlatformAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-keyra-text bg-keyra-text px-5 py-2.5 text-sm font-semibold text-keyra-bg transition hover:opacity-90"
            >
              Explore Keyra Platform
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-keyra-muted hover:text-keyra-primary"
        >
          ← Return to consultation options
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormHoneypot value={honeypot} onChange={setHoneypot} />

      <div className="flex items-center justify-between gap-4 border-b border-keyra-border/15 pb-4">
        <ConsultSectionTitle sub="Calendar · contact · secure video">
          Schedule Video Consultation
        </ConsultSectionTitle>
        <button
          type="button"
          onClick={step === "type" ? onBack : () => setStep(step === "calendar" ? "details" : "type")}
          className="shrink-0 text-sm font-medium text-keyra-muted hover:text-keyra-primary"
        >
          ← Back
        </button>
      </div>

      {/* Step indicators */}
      <ol className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-keyra-muted">
        {(["type", "details", "calendar"] as const).map((s, i) => {
          const active =
            (s === "type" && step === "type") ||
            (s === "details" && step === "details") ||
            (s === "calendar" && step === "calendar");
          const done =
            (s === "type" && step !== "type") ||
            (s === "details" && step === "calendar");
          return (
            <li
              key={s}
              className={`rounded-full px-3 py-1 ${
                active
                  ? "bg-keyra-text text-keyra-bg"
                  : done
                    ? "bg-keyra-surface-2 text-keyra-primary"
                    : "bg-keyra-surface text-keyra-muted"
              }`}
            >
              {i + 1}. {s === "type" ? "Type" : s === "details" ? "Details" : "Calendar"}
            </li>
          );
        })}
      </ol>

      {step === "type" ? (
        <div className="grid gap-4">
          {CONSULTATION_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTypeSelect(t.id)}
              className={`keyra-card rounded-2xl border p-5 text-left transition hover:border-keyra-text/25 ${
                consultationTypeId === t.id
                  ? "border-keyra-text/30 bg-keyra-surface-2"
                  : "border-keyra-border/80"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-semibold text-keyra-primary">
                  {t.title}
                </h4>
                <span className="text-xs font-medium text-keyra-muted">
                  {t.durationMinutes} min
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
                {t.description}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {step === "details" ? (
        <form onSubmit={onDetailsSubmit} className="space-y-6">
          {selectedType ? (
            <p className="text-sm text-keyra-muted">
              Selected: <span className="font-medium text-keyra-primary">{selectedType.title}</span>
              {" · "}
              {selectedType.durationMinutes} minutes
            </p>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="cal-name" className={consultLabel}>
                Name <span className="opacity-60">*</span>
              </label>
              <input id="cal-name" name="name" className={fieldClass("name")} onChange={() => clearError("name")} />
              {fieldErrors.name ? <ConsultFieldError id="name-err" text={fieldErrors.name} /> : null}
            </div>
            <div>
              <label htmlFor="cal-company" className={consultLabel}>Company *</label>
              <input id="cal-company" name="company" className={fieldClass("company")} />
            </div>
            <div>
              <label htmlFor="cal-title" className={consultLabel}>Title *</label>
              <input id="cal-title" name="title" className={fieldClass("title")} />
            </div>
            <div>
              <label htmlFor="cal-email" className={consultLabel}>Email *</label>
              <input id="cal-email" name="email" type="email" className={fieldClass("email")} />
            </div>
            <div>
              <span className={consultLabel}>Mobile Phone *</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select name="phoneCountry" defaultValue={DEFAULT_PHONE_COUNTRY_CODE} className={`${consultField} sm:w-36`}>
                  {PHONE_COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <input name="phoneNational" type="tel" className={`${consultField} flex-1`} />
              </div>
            </div>
            <div>
              <label htmlFor="cal-country" className={consultLabel}>Country *</label>
              <select id="cal-country" name="country" defaultValue="" className={fieldClass("country")}>
                <option value="" disabled>Select</option>
                {COUNTRY_ISO_OPTIONS.map((c) => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cal-org" className={consultLabel}>Organization Type *</label>
              <select id="cal-org" name="organizationType" defaultValue="" className={fieldClass("organizationType")}>
                <option value="" disabled>Select</option>
                {CONSULTATION_ORG_TYPES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={consultLabel}>Consultation Topic *</label>
            <TopicCheckboxGrid selected={topics} onChange={setTopics} error={fieldErrors.topics} />
          </div>
          <div>
            <label htmlFor="cal-objective" className={consultLabel}>Brief Meeting Objective *</label>
            <textarea
              id="cal-objective"
              name="meetingObjective"
              rows={4}
              className={fieldClass("meetingObjective")}
              placeholder="What would you like to accomplish in this session?"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-keyra-text bg-keyra-text px-8 py-3 text-sm font-semibold text-keyra-bg hover:opacity-90"
          >
            Continue to calendar
          </button>
        </form>
      ) : null}

      {step === "calendar" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="tz" className={consultLabel}>Timezone</label>
              <input
                id="tz"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={consultField}
              />
            </div>
            <button
              type="button"
              onClick={() => void loadAvailability()}
              disabled={loadingSlots}
              className="rounded-full border border-keyra-border px-4 py-2.5 text-sm font-medium text-keyra-primary"
            >
              {loadingSlots ? "Loading…" : "Refresh availability"}
            </button>
          </div>

          {loadingSlots && days.length === 0 ? (
            <p className="text-sm text-keyra-muted">Loading available times…</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.date);
                      setSelectedSlot("");
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      selectedDate === d.date
                        ? "border-keyra-text bg-keyra-surface-2 font-medium"
                        : "border-keyra-border/60"
                    }`}
                  >
                    {d.date}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
                {slotsForDate.map((slot) => (
                  <button
                    key={slot.startIso}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot.startIso);
                      clearError("startIso");
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                      selectedSlot === slot.startIso
                        ? "border-keyra-text bg-keyra-text text-keyra-bg"
                        : "border-keyra-border/70 hover:border-keyra-text/30"
                    }`}
                  >
                    {formatSlotLabel(slot.startIso, timezone)}
                  </button>
                ))}
              </div>
              {slotsForDate.length === 0 && !loadingSlots ? (
                <p className="text-sm text-keyra-muted">No slots for this date.</p>
              ) : null}
            </>
          )}

          {fieldErrors.startIso ? (
            <ConsultFieldError id="slot-err" text={fieldErrors.startIso} />
          ) : null}

          <TurnstileMount resetSignal={turnstileReset} onToken={setTurnstileToken} />

          <button
            type="button"
            disabled={pending || !selectedSlot}
            onClick={() => void confirmBooking()}
            className="w-full rounded-full border border-keyra-text bg-keyra-text py-3.5 text-sm font-semibold text-keyra-bg transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {pending ? "Confirming…" : "Confirm Video Consultation"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
