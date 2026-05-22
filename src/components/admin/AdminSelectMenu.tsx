"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { adminFilterSelect, adminListboxMenu, adminListboxOption } from "@/lib/admin/adminUiClasses";

export type AdminSelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  disabled?: boolean;
  className?: string;
  wide?: boolean;
  "aria-label"?: string;
  id?: string;
};

function FilterSelectChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("ds-filter-select__chevron", open && "is-open")}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterSelectCheck({ visible }: { visible: boolean }) {
  return (
    <span className="ds-listbox-option__mark" aria-hidden>
      {visible ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : null}
    </span>
  );
}

/** Filter-style select with black hover list (replaces native select popups on admin tabs). */
export function AdminSelectMenu({
  value,
  onChange,
  options,
  disabled = false,
  className,
  wide = false,
  "aria-label": ariaLabel,
  id: idProp,
}: Props) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block max-w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(adminFilterSelect, wide && "is-wide", open && "is-open", disabled && "is-disabled")}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
      >
        <span className="ds-filter-select__value">{selected?.label ?? "—"}</span>
        <FilterSelectChevron open={open} />
      </button>

      {open ? (
        <ul role="listbox" aria-labelledby={id} className={adminListboxMenu}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value || "__empty__"} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(adminListboxOption, active && "is-selected")}
                  onClick={() => pick(option.value)}
                >
                  <FilterSelectCheck visible={active} />
                  <span className="ds-listbox-option__label">{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
