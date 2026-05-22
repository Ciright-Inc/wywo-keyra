"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/ui/cn";

type UrlModeProps = {
  mode?: "url";
  searchQuery: string;
  buildHref: (query: string) => string;
  placeholder?: string;
  ariaLabel?: string;
  debounceMs?: number;
};

type ClientModeProps = {
  mode: "client";
  searchQuery: string;
  onChange: (query: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

type Props = UrlModeProps | ClientModeProps;

export function CollapsibleSearchBar(props: Props) {
  const isClientMode = props.mode === "client";
  const placeholder = props.placeholder ?? "Search…";
  const ariaLabel = props.ariaLabel ?? "Search";

  const router = useRouter();
  const [, startTransition] = useTransition();
  const hasSearch = props.searchQuery.trim().length > 0;
  const [expanded, setExpanded] = useState(hasSearch);
  const [qInput, setQInput] = useState(props.searchQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setQInput(props.searchQuery);
    if (props.searchQuery.trim()) setExpanded(true);
  }, [props.searchQuery]);

  useEffect(() => {
    if (expanded) {
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [expanded]);

  useEffect(() => {
    if (isClientMode) return;
    const next = qInput.trim();
    if (next === props.searchQuery.trim()) return;
    const debounceMs = props.debounceMs ?? 280;
    const t = setTimeout(() => {
      startTransition(() => {
        router.push(props.buildHref(next));
      });
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput, props.searchQuery, router, isClientMode]);

  function handleInputChange(value: string) {
    setQInput(value);
    if (isClientMode) props.onChange(value);
  }

  function collapseAndClear() {
    setQInput("");
    if (isClientMode) {
      props.onChange("");
    } else if (hasSearch) {
      startTransition(() => {
        router.push(props.buildHref(""));
      });
    }
    setExpanded(false);
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-label={expanded ? "Collapse search" : "Expand search"}
        aria-expanded={expanded}
        className={cn(
          "ds-btn-icon",
          (expanded || hasSearch) && "bg-[var(--ds-canvas-soft)]",
        )}
        style={{ width: 36, height: 36 }}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden>
          search
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-columns] duration-200 ease-out ${
          expanded ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={qInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              aria-label={ariaLabel}
              className={cn(
                "ds-text-input is-sm h-9 py-0 pl-3 transition-opacity duration-200",
                expanded ? "w-44 pr-8 opacity-100 sm:w-64" : "w-44 pointer-events-none opacity-0 sm:w-64",
              )}
            />
            {expanded ? (
              <button
                type="button"
                className="ds-btn-icon absolute right-0 top-1/2 -translate-y-1/2"
                style={{ width: 28, height: 28 }}
                onClick={collapseAndClear}
                aria-label="Clear search and collapse"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden>
                  close
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
