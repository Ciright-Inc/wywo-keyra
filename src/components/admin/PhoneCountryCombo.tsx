"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { adminInput } from "@/lib/admin/adminUiClasses";
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

  return (
    <div ref={rootRef} className={cn("relative", className)}>
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
        className={cn(
          adminInput,
          "flex h-10 min-h-10 items-center gap-2 py-0 text-left disabled:cursor-not-allowed disabled:opacity-55",
        )}
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
          <span className="hidden text-[var(--ds-body)] sm:inline"> · {selected.name}</span>
        </span>
        <span
          className={cn(
            "material-symbols-outlined shrink-0 text-[18px] text-[var(--ds-muted)] transition",
            open && "rotate-180",
          )}
          aria-hidden
        >
          expand_more
        </span>
      </button>

      {open ? (
        <div className="ds-feature-card absolute left-0 right-0 z-[200] mt-1 overflow-hidden p-0 shadow-[var(--ds-shadow-soft)]">
          <div className="border-b border-[var(--ds-hairline-strong)] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              autoComplete="off"
              aria-label="Search countries"
              className={cn(adminInput, "h-9 min-h-9 py-0")}
            />
          </div>
          <ul role="listbox" aria-labelledby={id} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 ds-body-sm text-[var(--ds-body)]">No countries match your search.</li>
            ) : (
              filtered.map((option) => {
                const active = option.code === value;
                return (
                  <li key={option.code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left ds-body-sm transition hover:bg-[var(--ds-canvas-soft)]",
                        active && "bg-[var(--ds-canvas-soft)] font-medium",
                      )}
                      onClick={() => pick(option)}
                    >
                      <span className="shrink-0 text-base leading-none" aria-hidden>
                        {flagEmojiFromIso2(option.code)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.name}</span>
                      <span className="shrink-0 font-mono text-xs text-[var(--ds-body)]">{option.dial}</span>
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
