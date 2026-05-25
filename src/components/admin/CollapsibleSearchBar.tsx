"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminDirectorySearch } from "@/components/admin/AdminDirectorySearch";

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
    <AdminDirectorySearch
      expanded={expanded}
      hasSearch={hasSearch}
      value={qInput}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      inputRef={inputRef}
      onToggle={() => setExpanded((open) => !open)}
      onChange={handleInputChange}
      onClear={collapseAndClear}
    />
  );
}
