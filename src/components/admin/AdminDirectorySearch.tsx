"use client";

import type { RefObject } from "react";

type Props = {
  expanded: boolean;
  hasSearch: boolean;
  value: string;
  placeholder: string;
  ariaLabel: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onToggle: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
};

/** Telcos-tab search UI — shared across deployment directory pages. */
export function AdminDirectorySearch({
  expanded,
  hasSearch,
  value,
  placeholder,
  ariaLabel,
  inputRef,
  onToggle,
  onChange,
  onClear,
}: Props) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? "Collapse search" : "Expand search"}
        aria-expanded={expanded}
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition duration-300 ${
          expanded || hasSearch
            ? "border-black/20 bg-keyra-bg text-keyra-primary ring-1 ring-black/10"
            : "border-keyra-border bg-keyra-bg text-keyra-text-2 hover:border-black/20 hover:text-keyra-primary"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20 16.65 16.65" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-columns] duration-300 ease-out ${
          expanded ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              aria-label={ariaLabel}
              className={`ds-text-input is-sm h-9 py-0 pl-3 transition-opacity duration-300 ${
                expanded ? "w-44 pr-8 opacity-100 sm:w-64" : "w-44 pointer-events-none opacity-0 sm:w-64"
              }`}
            />
            {expanded ? (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary"
                onClick={onClear}
                aria-label="Clear search and collapse"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
