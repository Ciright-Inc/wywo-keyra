"use client";

import { useEffect, useRef, useState } from "react";

export type WywoSelectOption = {
  value: string;
  label: string;
  /** Optional small note shown to the right of the label (e.g. "+91"). */
  hint?: string;
};

type Props = {
  value: string;
  onChange: (next: string) => void;
  options: readonly WywoSelectOption[];
  placeholder?: string;
  /** Hidden form input name for GET/POST submission. */
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  /** Full-width by default; pass a Tailwind width class to override. */
  widthClass?: string;
};

/**
 * Drop-in replacement for `<select>` that uses our custom popover, so the OS
 * (macOS Safari/Chrome) blue highlight on `<option>` rows never shows.
 * Visually matches `.ds-text-input.is-sm` and the WYWO country-code popover.
 */
export function WywoSelect({
  value,
  onChange,
  options,
  placeholder = "— select —",
  name,
  id,
  disabled,
  required,
  widthClass = "w-full",
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

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
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx === -1 ? 0 : idx);
    }
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[highlight] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(options.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) pick(opt.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${widthClass}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="wywo-select-trigger"
      >
        <span
          className={`wywo-select-trigger__label${selected ? "" : " is-placeholder"}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        {selected?.hint ? (
          <span className="wywo-select-trigger__hint ds-numeric">{selected.hint}</span>
        ) : null}
        <svg
          className="wywo-select-trigger__chevron"
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

      {name ? (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required && !value ? true : undefined}
        />
      ) : null}

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="wywo-select-pop"
        >
          {options.length === 0 ? (
            <li className="wywo-country-pop__empty">No options</li>
          ) : (
            options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isHi = i === highlight;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(opt.value);
                  }}
                  className={`wywo-select-row${isHi ? " is-hi" : ""}${
                    isSelected ? " is-selected" : ""
                  }`}
                >
                  <span className="wywo-select-row__label">{opt.label}</span>
                  {opt.hint ? (
                    <span className="wywo-select-row__hint ds-numeric">{opt.hint}</span>
                  ) : null}
                  {isSelected ? (
                    <svg
                      className="wywo-select-row__check"
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="m3.5 8.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
