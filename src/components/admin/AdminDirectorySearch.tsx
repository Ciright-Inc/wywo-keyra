"use client";

import type { RefObject } from "react";
import { cn } from "@/components/ui/cn";

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

/** Admin directory collapsible search — icon on title row; expands to a unified input group. */
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
  const isActive = expanded || hasSearch;

  return (
    <div className={cn("ds-directory-search", isActive && "is-active", expanded && "is-expanded")}>
      <div className="ds-directory-search__control">
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse search" : "Expand search"}
          aria-expanded={expanded}
          className={cn("ds-directory-search__toggle", isActive && "is-active")}
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
        <div className={cn("ds-directory-search__field", expanded && "is-open")}>
          <div className="ds-directory-search__input-wrap">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              aria-label={ariaLabel}
              className="ds-directory-search__input"
              tabIndex={expanded ? 0 : -1}
            />
            {expanded ? (
              <button
                type="button"
                className="ds-directory-search__clear"
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
