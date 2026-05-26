"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PHONE_COUNTRY_OPTIONS,
  type PhoneCountryOption,
} from "@/lib/phoneCountryOptions";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Width class for the trigger button. Defaults to a compact 112px. */
  widthClass?: string;
  disabled?: boolean;
  buttonId?: string;
  name?: string;
};

const DEFAULT_WIDTH_CLASS = "w-[112px]";

/** Convert a 2-letter ISO 3166-1 alpha-2 code into the regional-indicator emoji flag. */
function flagEmoji(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return "🌐";
  const A_CODE = 0x1f1e6;
  const codePoints = isoCode
    .toUpperCase()
    .split("")
    .map((c) => A_CODE + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function matches(opt: PhoneCountryOption, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().replace(/\s+/g, "");
  return (
    opt.name.toLowerCase().includes(q) ||
    opt.code.toLowerCase().includes(q) ||
    opt.dial.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
    opt.dial.toLowerCase().includes(q)
  );
}

export function WywoCountryCodeSelect({
  value,
  onChange,
  widthClass = DEFAULT_WIDTH_CLASS,
  disabled,
  buttonId,
  name,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo<PhoneCountryOption>(
    () =>
      PHONE_COUNTRY_OPTIONS.find((o) => o.code === value) ?? PHONE_COUNTRY_OPTIONS[0],
    [value],
  );

  const filtered = useMemo(
    () => PHONE_COUNTRY_OPTIONS.filter((o) => matches(o, query)),
    [query],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const idx = filtered.findIndex((o) => o.code === selected.code);
      setHighlight(idx === -1 ? 0 : idx);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[highlight] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function pick(opt: PhoneCountryOption) {
    onChange(opt.code);
    setOpen(false);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) pick(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative shrink-0 ${widthClass}`}>
      <button
        type="button"
        id={buttonId}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="wywo-country-trigger"
      >
        <span aria-hidden className="wywo-country-trigger__flag">
          {flagEmoji(selected.code)}
        </span>
        <span className="wywo-country-trigger__dial ds-numeric">{selected.dial}</span>
        <svg
          className="wywo-country-trigger__chevron"
          viewBox="0 0 16 16"
          width="11"
          height="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <path d="M3 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {name ? <input type="hidden" name={name} value={selected.code} /> : null}

      {open ? (
        <div className="wywo-country-pop">
          <div className="wywo-country-pop__search">
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
              className="text-[var(--ds-muted)]"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="m13 13-2.5-2.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search country or code"
              aria-label="Search country"
              className="wywo-country-pop__input"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="wywo-country-pop__clear"
              >
                ×
              </button>
            ) : null}
          </div>
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Country code"
            className="wywo-country-pop__list"
          >
            {filtered.length === 0 ? (
              <li className="wywo-country-pop__empty">No matches</li>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.code === selected.code;
                const isHi = i === highlight;
                return (
                  <li
                    key={opt.code}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(opt);
                    }}
                    className={`wywo-country-pop__row${isHi ? " is-hi" : ""}${
                      isSelected ? " is-selected" : ""
                    }`}
                  >
                    <span aria-hidden className="wywo-country-pop__flag">
                      {flagEmoji(opt.code)}
                    </span>
                    <span className="wywo-country-pop__name">{opt.name}</span>
                    <span className="wywo-country-pop__dial ds-numeric">{opt.dial}</span>
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
