"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";
import { isValidMobileE164 } from "@/lib/keyraRegistrationValidation";
import { toE164 } from "@/lib/wywo/phone";

const SLIP_CHECKS = [
  { id: "telephoned", label: "Telephoned" },
  { id: "called", label: "Called To See You" },
  { id: "wants", label: "Wants To See You" },
  { id: "please-call", label: "Please Call" },
  { id: "will-call", label: "Will Call Again" },
  { id: "urgent", label: "Urgent" },
  { id: "returned", label: "Returned Your Call" },
] as const;

type CheckId = (typeof SLIP_CHECKS)[number]["id"];

type SlipDraft = {
  to: string;
  from: string;
  company: string;
  phone: string;
  areaCode: string;
  number: string;
  extension: string;
  message: string;
  date: string;
  time: string;
  operator: string;
  checks: Record<CheckId, boolean>;
};

const DRAFT_KEY = "wywo-slip-draft-v2";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIME = /^\d{2}:\d{2}$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function defaultDateValue(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function defaultTimeValue(d = new Date()): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

const emptyDraft = (): SlipDraft => ({
  to: "",
  from: "",
  company: "",
  phone: "",
  areaCode: "",
  number: "",
  extension: "",
  message: "",
  date: defaultDateValue(),
  time: defaultTimeValue(),
  operator: "",
  checks: Object.fromEntries(SLIP_CHECKS.map((c) => [c.id, false])) as Record<CheckId, boolean>,
});

function normalizeDraft(parsed: Partial<SlipDraft>): SlipDraft {
  const base = emptyDraft();
  return {
    ...base,
    ...parsed,
    date: parsed.date && ISO_DATE.test(parsed.date) ? parsed.date : base.date,
    time: parsed.time && ISO_TIME.test(parsed.time) ? parsed.time : base.time,
    checks: { ...base.checks, ...(parsed.checks ?? {}) },
  };
}

function loadDraft(): SlipDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    return normalizeDraft(JSON.parse(raw) as Partial<SlipDraft>);
  } catch {
    return emptyDraft();
  }
}

const fieldClass = "ds-text-input is-sm wywo-slip__control";

function slipRecipientPhone(draft: SlipDraft): string | null {
  const direct = toE164(draft.phone.trim());
  if (direct) return direct;
  const digits = `${draft.areaCode}${draft.number}`.replace(/\D/g, "");
  if (digits) {
    const combined = toE164(digits.startsWith("+") ? digits : `+${digits}`);
    if (combined) return combined;
  }
  const fromTo = toE164(draft.to.trim());
  if (fromTo) return fromTo;
  return null;
}

function buildSlipSubject(draft: SlipDraft): string {
  const flags = SLIP_CHECKS.filter((c) => draft.checks[c.id]).map((c) => c.label);
  if (flags.length === 0) return "While You Were Out";
  return `WYWO — ${flags.join(", ")}`;
}

function buildSlipBody(draft: SlipDraft): string {
  const lines = [
    draft.message.trim(),
    "",
    `To: ${draft.to.trim() || "—"}`,
    `From: ${draft.from.trim() || "—"}`,
    draft.company.trim() ? `Company: ${draft.company.trim()}` : null,
    `Date: ${draft.date}`,
    `Time: ${draft.time}`,
    draft.operator.trim() ? `Operator: ${draft.operator.trim()}` : null,
  ].filter((line): line is string => line != null && line !== "");
  return lines.join("\n").trim();
}

type Props = {
  signedIn: boolean;
};

/**
 * Interactive digital WYWO slip — Keyra monochrome system, custom date/time pickers.
 */
export function WywoDigitalSlip({ signedIn }: Props) {
  const router = useRouter();
  const formId = useId();
  const [draft, setDraft] = useState<SlipDraft>(emptyDraft);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const popoverRootRef = useRef<HTMLDivElement | null>(null);

  const datePopoverId = `${formId}-date-popover`;
  const timePopoverId = `${formId}-time-popover`;

  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    // Initial calendar month follows the current draft date.
    if (!ISO_DATE.test(emptyDraft().date)) return new Date();
    const [y, m] = emptyDraft().date.split("-").map((x) => Number(x));
    return new Date(y, m - 1, 1);
  });

  useEffect(() => {
    setDraft(loadDraft());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore quota */
    }
  }, [draft, mounted]);

  // Close pickers when clicking outside the slip.
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const inside = popoverRootRef.current?.contains(target);
      if (!inside) {
        setDateOpen(false);
        setTimeOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const patch = useCallback((partial: Partial<SlipDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleCheck = useCallback((id: CheckId) => {
    setDraft((prev) => ({
      ...prev,
      checks: { ...prev.checks, [id]: !prev.checks[id] },
    }));
  }, []);

  const formattedDate = useMemo(() => {
    if (!ISO_DATE.test(draft.date)) return draft.date;
    const [y, m, d] = draft.date.split("-").map((x) => Number(x));
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" });
  }, [draft.date]);

  const formattedTime = useMemo(() => {
    if (!ISO_TIME.test(draft.time)) return draft.time;
    const [hh, mm] = draft.time.split(":").map((x) => Number(x));
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;
    return `${pad2(hour12)}:${pad2(mm)} ${ampm}`;
  }, [draft.time]);

  const selectedYMD = useMemo(() => {
    if (!ISO_DATE.test(draft.date)) return { y: NaN, m: NaN, d: NaN };
    const [y, m, d] = draft.date.split("-").map((x) => Number(x));
    return { y, m, d };
  }, [draft.date]);

  const calendar = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth(); // 0-11
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];
    for (let i = 0; i < 42; i++) {
      const dayNum = i - firstDow + 1;
      if (dayNum < 1 || dayNum > daysInMonth) cells.push(null);
      else cells.push(dayNum);
    }
    return { year, month, firstDow, daysInMonth, cells };
  }, [monthCursor]);

  const timeParts = useMemo(() => {
    const fallbackNow = () => {
      const now = new Date();
      const hh = now.getHours();
      const mm = now.getMinutes();
      const ampm = hh >= 12 ? "PM" : "AM";
      const hour12 = ((hh + 11) % 12) + 1;
      return { hour12, minute: mm, ampm, hour24: hh };
    };
    if (!ISO_TIME.test(draft.time)) return fallbackNow();
    const [hh, mm] = draft.time.split(":").map((x) => Number(x));
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;
    return { hour12, minute: mm, ampm: ampm as "AM" | "PM", hour24: hh };
  }, [draft.time]);

  function setTimeFromParts(nextHour12: number, nextMinute: number, nextAmpm: "AM" | "PM") {
    const hour24 = nextAmpm === "AM" ? nextHour12 % 12 : (nextHour12 % 12) + 12;
    const nextTime = `${pad2(hour24)}:${pad2(nextMinute)}`;
    setDraft((prev) => ({ ...prev, time: nextTime }));
    setTimeOpen(false);
  }

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    const recipientPhone = slipRecipientPhone(draft);
    if (!recipientPhone || !isValidMobileE164(recipientPhone)) {
      setSubmitError(
        "Enter a valid recipient mobile number in Phone or Area code + Number (include country code).",
      );
      return;
    }
    if (!draft.message.trim()) {
      setSubmitError("Message is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wywo/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientPhone,
          recipientName: draft.to.trim() || null,
          subject: buildSlipSubject(draft),
          body: buildSlipBody(draft),
          urgent: draft.checks.urgent,
          category: "general",
          priority: draft.checks.urgent ? "high" : "normal",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push("/wywo/sent");
      router.refresh();
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  return (
    <div ref={popoverRootRef}>
      <form
      id={formId}
      className="keyra-card wywo-slip"
      aria-label="While You Were Out message slip"
      onSubmit={(e) => e.preventDefault()}
    >
      <p className="ds-caption-uppercase wywo-slip__masthead">While You Were Out</p>

      <header className="wywo-slip__header">
        <div className="wywo-slip__field wywo-slip__field--grow">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-to`}>
            To
          </label>
          <input
            id={`${formId}-to`}
            className={fieldClass}
            type="text"
            autoComplete="name"
            value={draft.to}
            onChange={(e) => patch({ to: e.target.value })}
            placeholder="Recipient name"
          />
        </div>
        <div className="wywo-slip__field wywo-slip__field--date">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-date`}>
            Date
          </label>
          <input
            id={`${formId}-date`}
            className={`${fieldClass} wywo-slip__picker-field`}
            type="text"
            readOnly
            value={formattedDate}
            aria-haspopup="dialog"
            aria-expanded={dateOpen}
            aria-controls={datePopoverId}
            onClick={() => {
              // Keep month cursor aligned with the selected date.
              if (ISO_DATE.test(draft.date)) {
                const [y, m] = draft.date.split("-").map((x) => Number(x));
                setMonthCursor(new Date(y, m - 1, 1));
              }
              setDateOpen((v) => !v);
              setTimeOpen(false);
            }}
          />
          <button
            type="button"
            className="wywo-slip__picker-trigger"
            aria-label="Choose date"
            aria-haspopup="dialog"
            aria-expanded={dateOpen}
            aria-controls={datePopoverId}
            onClick={() => {
              if (ISO_DATE.test(draft.date)) {
                const [y, m] = draft.date.split("-").map((x) => Number(x));
                setMonthCursor(new Date(y, m - 1, 1));
              }
              setDateOpen((v) => !v);
              setTimeOpen(false);
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
            >
              <path
                d="M7 3v3M17 3v3M4.5 9.5h15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M6.5 5.5h11A2 2 0 0 1 19.5 7.5v12a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dateOpen ? (
            <div id={datePopoverId} role="dialog" aria-label="Pick a date" className="wywo-slip-picker-popover">
              <div className="wywo-slip-picker-top">
                <button
                  type="button"
                  className="wywo-slip-picker-icon"
                  onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  ↑
                </button>
                <div className="wywo-slip-picker-title">
                  {calendar.year}-{pad2(calendar.month + 1)}
                </div>
                <button
                  type="button"
                  className="wywo-slip-picker-icon"
                  onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  ↓
                </button>
              </div>

              <div className="wywo-slip-picker-weekdays" aria-hidden>
                {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
                  <div key={`${w}-${i}`}>{w}</div>
                ))}
              </div>

              <div className="wywo-slip-picker-grid">
                {calendar.cells.map((dayNum, idx) => {
                  const isSelected =
                    dayNum != null &&
                    selectedYMD.y === calendar.year &&
                    selectedYMD.m === calendar.month + 1 &&
                    selectedYMD.d === dayNum;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`wywo-slip-picker-day${isSelected ? " is-active" : ""}${
                        dayNum == null ? " is-empty" : ""
                      }`}
                      disabled={dayNum == null}
                      onClick={() => {
                        if (dayNum == null) return;
                        patch({
                          date: `${calendar.year}-${pad2(calendar.month + 1)}-${pad2(dayNum)}`,
                        });
                        setDateOpen(false);
                      }}
                    >
                      {dayNum ?? ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <div className="wywo-slip__field wywo-slip__field--time">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-time`}>
            Time
          </label>
          <input
            id={`${formId}-time`}
            className={`${fieldClass} wywo-slip__picker-field`}
            type="text"
            readOnly
            value={formattedTime}
            aria-haspopup="dialog"
            aria-expanded={timeOpen}
            aria-controls={timePopoverId}
            onClick={() => {
              setTimeOpen((v) => !v);
              setDateOpen(false);
            }}
          />
          <button
            type="button"
            className="wywo-slip__picker-trigger"
            aria-label="Choose time"
            aria-haspopup="dialog"
            aria-expanded={timeOpen}
            aria-controls={timePopoverId}
            onClick={() => {
              setTimeOpen((v) => !v);
              setDateOpen(false);
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
            >
              <path
                d="M12 7.5v5l3 1.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          {timeOpen ? (
            <div
              id={timePopoverId}
              role="dialog"
              aria-label="Pick a time"
              className="wywo-slip-picker-popover wywo-slip-picker-popover--time"
            >
              <div className="wywo-slip-picker-time-ampm">
                {(["AM", "PM"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`wywo-slip-picker-chip${timeParts.ampm === v ? " is-active" : ""}`}
                    onClick={() => setTimeFromParts(timeParts.hour12, timeParts.minute, v)}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="wywo-slip-picker-two-col">
                <div>
                  <div className="wywo-slip-picker-subtitle">Hour</div>
                  <div className="wywo-slip-picker-grid-hours">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`wywo-slip-picker-chip${timeParts.hour12 === h ? " is-active" : ""}`}
                        onClick={() => setTimeFromParts(h, timeParts.minute, timeParts.ampm)}
                      >
                        {pad2(h)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="wywo-slip-picker-subtitle">Minute</div>
                  <div className="wywo-slip-picker-grid-minutes">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => {
                      const activeMinute = Math.round(timeParts.minute / 5) * 5;
                      const isActive = activeMinute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          className={`wywo-slip-picker-chip${isActive ? " is-active" : ""}`}
                          onClick={() => setTimeFromParts(timeParts.hour12, m, timeParts.ampm)}
                        >
                          {pad2(m)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="wywo-slip-picker-actions">
                <button type="button" className="wywo-slip-picker-done" onClick={() => setTimeOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="wywo-slip__row">
        <label
          className="ds-caption-uppercase wywo-slip__label wywo-slip__label--inline"
          htmlFor={`${formId}-from`}
        >
          From
        </label>
        <input
          id={`${formId}-from`}
          className={`${fieldClass} wywo-slip__control--grow`}
          type="text"
          autoComplete="name"
          value={draft.from}
          onChange={(e) => patch({ from: e.target.value })}
          placeholder="Caller name"
        />
      </div>

      <div className="wywo-slip__row">
        <label
          className="ds-caption-uppercase wywo-slip__label wywo-slip__label--inline"
          htmlFor={`${formId}-company`}
        >
          Of / Company
        </label>
        <input
          id={`${formId}-company`}
          className={`${fieldClass} wywo-slip__control--grow`}
          type="text"
          autoComplete="organization"
          value={draft.company}
          onChange={(e) => patch({ company: e.target.value })}
          placeholder="Company or organisation"
        />
      </div>

      <div className="wywo-slip__row wywo-slip__row--phone">
        <div className="wywo-slip__field">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-phone`}>
            Phone
          </label>
          <input
            id={`${formId}-phone`}
            className={fieldClass}
            type="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(e) => patch({ phone: e.target.value })}
          />
        </div>
        <div className="wywo-slip__field">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-area`}>
            Area code
          </label>
          <input
            id={`${formId}-area`}
            className={fieldClass}
            type="text"
            inputMode="tel"
            value={draft.areaCode}
            onChange={(e) => patch({ areaCode: e.target.value })}
          />
        </div>
        <div className="wywo-slip__field">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-number`}>
            Number
          </label>
          <input
            id={`${formId}-number`}
            className={fieldClass}
            type="text"
            inputMode="tel"
            value={draft.number}
            onChange={(e) => patch({ number: e.target.value })}
          />
        </div>
        <div className="wywo-slip__field">
          <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-ext`}>
            Extension
          </label>
          <input
            id={`${formId}-ext`}
            className={fieldClass}
            type="text"
            value={draft.extension}
            onChange={(e) => patch({ extension: e.target.value })}
          />
        </div>
      </div>

      <div className="wywo-slip__checks" role="group" aria-label="Message disposition">
        {SLIP_CHECKS.map((item) => (
          <label key={item.id} className="wywo-slip__check">
            <input
              type="checkbox"
              checked={draft.checks[item.id]}
              onChange={() => toggleCheck(item.id)}
            />
            <span className="ds-body-sm">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="wywo-slip__message">
        <label className="ds-caption-uppercase wywo-slip__label" htmlFor={`${formId}-message`}>
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          className={`${fieldClass} wywo-slip__textarea`}
          rows={4}
          value={draft.message}
          onChange={(e) => patch({ message: e.target.value })}
          placeholder="Your trusted message — verified humans and verified agents only."
        />
      </div>

      <footer className="wywo-slip__footer">
        <div className="wywo-slip__brand">
          <Image
            src={KEYRA_LOGO_SRC}
            alt="Keyra"
            width={96}
            height={38}
            className="wywo-slip__brand-img"
          />
        </div>
        <div className="wywo-slip__footer-meta">
          <p className="ds-caption-uppercase wywo-slip__domain">WYWO.KEYRA.IE</p>
          <label className="wywo-slip__operator">
            <span className="ds-caption-uppercase wywo-slip__label">Operator</span>
            <input
              className={`${fieldClass} wywo-slip__control--operator`}
              type="text"
              value={draft.operator}
              onChange={(e) => patch({ operator: e.target.value })}
              placeholder="Initials"
            />
          </label>
        </div>
      </footer>

      {signedIn ? (
        <div className="wywo-slip__submit">
          {submitError ? <p className="wywo-slip__submit-error">{submitError}</p> : null}
          <button
            type="button"
            className="ds-btn-primary wywo-slip__submit-btn"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? "Sending…" : "Submit slip"}
          </button>
        </div>
      ) : (
        <p className="ds-caption wywo-slip__save-hint">
          Your slip draft is saved in this browser. Sign in with your phone to submit.
        </p>
      )}
    </form>
    </div>
  );
}
