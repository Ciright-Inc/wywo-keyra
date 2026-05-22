import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";

export type TablePaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
};

type Props = TablePaginationMeta & {
  pageSizeOptions: readonly number[];
  /** Builds a URL targeting (page, pageSize); query, sort, etc. are owned by the host page. */
  buildHref: (page: number, pageSize: number) => string;
  /** When set, pagination uses soft navigation (keeps list visible while loading). */
  onNavigate?: (href: string) => void;
  /** Optional. Defaults to `"row"` — used in the screen-reader summary as in "Rows: 1–25 of 240 rows". */
  rowNoun?: string;
};

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

function PaginationLink({
  href,
  className,
  onNavigate,
  children,
  ...rest
}: {
  href: string;
  className: string;
  onNavigate?: (href: string) => void;
  children: ReactNode;
} & ComponentPropsWithoutRef<"a">) {
  if (onNavigate) {
    return (
      <AdminTransitionLink href={href} onNavigate={onNavigate} className={className} {...rest}>
        {children}
      </AdminTransitionLink>
    );
  }
  return (
    <Link href={href} prefetch={false} className={className} {...rest}>
      {children}
    </Link>
  );
}

/**
 * Standard pagination footer for admin list tabs.
 */
export function TablePagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  showingFrom,
  showingTo,
  pageSizeOptions,
  buildHref,
  onNavigate,
}: Props) {
  if (totalCount === 0) return null;
  const pagerItems = pageNumbers(page, totalPages);

  const pageLinkClass =
    "inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition";
  const inactivePageClass = `${pageLinkClass} border-keyra-border bg-keyra-bg text-keyra-primary hover:border-black/20 hover:bg-keyra-surface`;
  const activePageClass = `${pageLinkClass} border-black/25 bg-keyra-bg font-semibold text-keyra-primary ring-1 ring-black/10`;

  return (
    <div className="flex flex-col gap-3 border-t border-keyra-border bg-keyra-bg/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
            <span
              key={sz}
              className={`${activePageClass} pointer-events-none min-w-14 cursor-default`}
              aria-current="page"
            >
              {sz}
            </span>
          ) : (
            <PaginationLink
              key={sz}
              href={buildHref(1, sz)}
              onNavigate={onNavigate}
              className={inactivePageClass}
            >
              {sz}
            </PaginationLink>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <PaginationLink
          href={buildHref(Math.max(1, page - 1), pageSize)}
          onNavigate={onNavigate}
          aria-disabled={page <= 1}
          className={`${inactivePageClass} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          Previous
        </PaginationLink>
        {pagerItems.map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-2 text-keyra-text-2">
              …
            </span>
          ) : item === page ? (
            <span key={item} className={`${activePageClass} pointer-events-none min-w-10`}>
              {item}
            </span>
          ) : (
            <PaginationLink
              key={item}
              href={buildHref(item, pageSize)}
              onNavigate={onNavigate}
              className={inactivePageClass}
            >
              {item}
            </PaginationLink>
          ),
        )}
        <PaginationLink
          href={buildHref(Math.min(totalPages, page + 1), pageSize)}
          onNavigate={onNavigate}
          aria-disabled={page >= totalPages}
          className={`${inactivePageClass} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          Next
        </PaginationLink>
      </div>
    </div>
  );
}
