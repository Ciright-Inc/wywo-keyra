"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { fieldClass } from "@/components/admin/AdminFieldError";
import { adminInput, adminListboxOption } from "@/lib/admin/adminUiClasses";
import {
  COUNTRY_FLAG_OPTIONS,
  findCountryFlagOption,
  matchesCountryFlagQuery,
  type CountryFlagOption,
} from "@/lib/countryFlagOptions";

type Props = {
  id: string;
  flagEmoji: string;
  iso2?: string;
  onChange: (flagEmoji: string) => void;
  onCountrySelect?: (option: CountryFlagOption) => void;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
};

export function CountryFlagCombo({
  id,
  flagEmoji,
  iso2,
  onChange,
  onCountrySelect,
  disabled = false,
  hasError = false,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => findCountryFlagOption(iso2, flagEmoji), [iso2, flagEmoji]);

  const filtered = useMemo(
    () => COUNTRY_FLAG_OPTIONS.filter((option) => matchesCountryFlagQuery(option, query)),
    [query],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(option: CountryFlagOption) {
    onChange(option.flagEmoji);
    onCountrySelect?.(option);
    setOpen(false);
    setQuery("");
  }

  function clearSelection() {
    onChange("");
    setOpen(false);
    setQuery("");
  }

  const triggerClass = fieldClass(
    cn(
      adminInput,
      "inline-flex h-10 w-12 min-h-10 shrink-0 items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-55",
    ),
    hasError,
  );

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `Country flag: ${selected.name}` : "Choose country flag"}
        title={selected ? selected.name : "Choose country flag"}
        className={triggerClass}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
          if (open) setQuery("");
        }}
      >
        <span className="text-xl leading-none" aria-hidden>
          {selected?.flagEmoji ?? "🏳️"}
        </span>
      </button>

      {open ? (
        <div className="ds-feature-card absolute left-0 z-[220] mt-1 w-[min(92vw,18rem)] overflow-hidden p-0 shadow-[var(--ds-shadow-soft)]">
          <div className="border-b border-[var(--ds-hairline-strong)] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country name…"
              autoComplete="off"
              aria-label="Search countries"
              className={cn(adminInput, "h-9 min-h-9 py-0")}
            />
          </div>
          <ul role="listbox" aria-labelledby={id} className="max-h-56 overflow-y-auto p-1">
            {flagEmoji ? (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  className={adminListboxOption}
                  onClick={clearSelection}
                >
                  Clear flag
                </button>
              </li>
            ) : null}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 ds-body-sm text-[var(--ds-body)]">No countries match your search.</li>
            ) : (
              filtered.map((option) => {
                const active = selected?.iso2 === option.iso2;
                return (
                  <li key={option.iso2} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={cn(adminListboxOption, active && "is-selected")}
                      onClick={() => pick(option)}
                    >
                      <span className="shrink-0 text-base leading-none" aria-hidden>
                        {option.flagEmoji}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.name}</span>
                      <span className="shrink-0 font-mono text-xs text-[var(--ds-body)]">{option.iso2}</span>
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
