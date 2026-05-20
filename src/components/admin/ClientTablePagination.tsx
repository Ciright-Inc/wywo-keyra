"use client";

import type { ReactElement } from "react";

/**
 * Pagination footer for admin list tabs that page an already-loaded array in memory
 * (no URL/route round-trip). Visual matches the URL-based `TablePagination`, but
 * uses callbacks instead of `<Link>` so cross-page state (selected rows, dirty edits)
 * stays intact while the user clicks through pages.
 */

function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const neighbors = new Set<number>();
  for (let d = -2; d <= 2; d += 1) {
    const p = current + d;
    if (p >= 1 && p <= total) neighbors.add(p);
  }
  neighbors.add(1);
  neighbors.add(total);
  const sorted = Array.from(neighbors).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    if (i > 0 && sorted[i - 1] !== undefined && p - sorted[i - 1]! > 1) out.push("gap");
    out.push(p);
  }
  return out;
}

type Props = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
};

export function ClientTablePagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  showingFrom,
  showingTo,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  disabled,
}: Props): ReactElement {
  const pagerItems = pageNumbers(page, totalPages);
  const baseBtn =
    "inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
  const inactiveBtn = `${baseBtn} border-keyra-border bg-keyra-bg text-keyra-primary hover:border-black/20 hover:bg-keyra-surface`;
  const activeBtn = `${baseBtn} border-black/25 bg-keyra-bg font-semibold text-keyra-primary ring-1 ring-black/10 pointer-events-none`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-keyra-border bg-keyra-bg/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-keyra-text-2">
        Page <span className="font-semibold text-keyra-primary">{page}</span> of{" "}
        <span className="font-semibold text-keyra-primary">{totalPages}</span>
        <span className="text-keyra-text-2">
          {" "}
          ({showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {totalCount.toLocaleString()})
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wide text-keyra-text-2">Rows</span>
        {pageSizeOptions.map((sz) =>
          sz === pageSize ? (
            <span key={sz} className={`${activeBtn} min-w-14`} aria-current="page">
              {sz}
            </span>
          ) : (
            <button
              key={sz}
              type="button"
              className={`${inactiveBtn} min-w-14`}
              onClick={() => onPageSizeChange(sz)}
              disabled={disabled}
            >
              {sz}
            </button>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className={inactiveBtn}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={disabled || page <= 1}
        >
          Previous
        </button>
        {pagerItems.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-2 text-keyra-text-2">
              …
            </span>
          ) : item === page ? (
            <span key={item} className={`${activeBtn} min-w-10`}>
              {item}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={inactiveBtn}
              onClick={() => onPageChange(item)}
              disabled={disabled}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className={inactiveBtn}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={disabled || page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
