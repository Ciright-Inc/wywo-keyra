"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import { PHONE_COUNTRY_OPTIONS, type PhoneCountryOption } from "@/lib/phoneCountryOptions";

function matchesQuery(option: PhoneCountryOption, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const dialDigits = option.dial.replace(/\D/g, "");
  const qDigits = q.replace(/\D/g, "");
  return (
    option.name.toLowerCase().includes(q) ||
    option.code.toLowerCase().includes(q) ||
    option.dial.toLowerCase().includes(q) ||
    (qDigits.length > 0 && dialDigits.includes(qDigits))
  );
}

function optionLabel(option: PhoneCountryOption): string {
  return `${flagEmojiFromIso2(option.code)} ${option.dial} ${option.name}`;
}

type Props = {
  id: string;
  value: string;
  onChange: (isoCode: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function PhoneCountryCombo({
  id,
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected =
    PHONE_COUNTRY_OPTIONS.find((c) => c.code === value) ??
    PHONE_COUNTRY_OPTIONS.find((c) => c.code === "IE") ??
    PHONE_COUNTRY_OPTIONS[0];

  const filtered = useMemo(
    () => PHONE_COUNTRY_OPTIONS.filter((c) => matchesQuery(c, query)),
    [query],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(option: PhoneCountryOption) {
    onChange(option.code);
    setOpen(false);
    setQuery("");
  }

  const triggerClass =
    "flex h-10 w-full items-center gap-2 rounded-lg border border-keyra-border bg-keyra-bg px-3 text-left text-sm text-keyra-primary shadow-sm outline-none transition hover:border-black/20 focus-visible:border-black/25 focus-visible:keyra-focus disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute size-0 opacity-0"
          value={value}
          required
          onChange={() => {}}
        />
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected.name}, ${selected.dial}`}
        className={triggerClass}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          if (open) setQuery("");
        }}
      >
        <span className="shrink-0 text-base leading-none" aria-hidden>
          {flagEmojiFromIso2(selected.code)}
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium">{selected.dial}</span>
          <span className="hidden text-keyra-text-2 sm:inline"> · {selected.name}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`shrink-0 text-keyra-text-2 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-[200] mt-1 overflow-hidden rounded-xl border border-keyra-border bg-keyra-bg shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <div className="border-b border-keyra-border p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              autoComplete="off"
              aria-label="Search countries"
              className="h-9 w-full rounded-lg border border-keyra-border bg-keyra-surface px-3 text-sm text-keyra-primary outline-none focus-visible:border-black/25 focus-visible:keyra-focus"
            />
          </div>
          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-keyra-text-2">No countries match your search.</li>
            ) : (
              filtered.map((option) => {
                const active = option.code === value;
                return (
                  <li key={option.code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-keyra-surface ${
                        active ? "bg-keyra-surface font-medium text-keyra-primary" : "text-keyra-primary"
                      }`}
                      onClick={() => pick(option)}
                    >
                      <span className="shrink-0 text-base leading-none" aria-hidden>
                        {flagEmojiFromIso2(option.code)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.name}</span>
                      <span className="shrink-0 font-mono text-xs text-keyra-text-2">{option.dial}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export { optionLabel as phoneCountryOptionLabel };
