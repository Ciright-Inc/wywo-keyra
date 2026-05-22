"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type UrlModeProps = {
  mode?: "url";
  /** Current query value from the URL (controls open-by-default + reset behavior). */
  searchQuery: string;
  /** Builds the destination URL for a given query string (page resets to 1 inside). */
  buildHref: (query: string) => string;
  /** Input placeholder. */
  placeholder?: string;
  /** Optional aria-label override; defaults to `Search`. */
  ariaLabel?: string;
  /** Optional debounce in milliseconds; defaults to 280. */
  debounceMs?: number;
};

type ClientModeProps = {
  mode: "client";
  /** Current query value managed by the parent. */
  searchQuery: string;
  /** Called whenever the input changes (no debounce — caller can debounce if needed). */
  onChange: (query: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

type Props = UrlModeProps | ClientModeProps;

/**
 * Shared collapsible search affordance used across admin list tabs.
 *
 * UX matches the Telcos directory: a 36px icon button that slides an input out to the right
 * with an inline X to clear + collapse. Typing is debounced and pushes the new query into
 * the URL via Next.js router, so the underlying server component re-renders filtered rows.
 *
 * IMPORTANT: This component only updates the URL. The host page is responsible for reading
 * `searchParams.q`, applying it as a Prisma `where` filter, and resetting to page 1 when the
 * query changes (handled by passing a `buildHref` that always emits `page=1`).
 */
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
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 active:bg-keyra-surface ${
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
              className={`h-9 rounded-lg border border-keyra-border bg-keyra-bg py-0 pl-3 text-sm text-keyra-primary outline-none transition-opacity duration-200 focus-visible:border-black/25 focus-visible:keyra-focus ${
                expanded ? "w-44 pr-8 opacity-100 sm:w-64" : "w-44 pointer-events-none opacity-0 sm:w-64"
              }`}
            />
            {expanded ? (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary"
                onClick={collapseAndClear}
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
