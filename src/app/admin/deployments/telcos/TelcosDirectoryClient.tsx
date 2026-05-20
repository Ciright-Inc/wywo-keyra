"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["IDENTIFIED", "INSTITUTIONAL_AWARENESS", "TVIP", "OPERATIONAL"] as const;

type CountryOption = { id: string; name: string; iso2: string };

export type TelcoRow = {
  id: string;
  name: string;
  telcoSubdomain: string;
  status: string;
  isPublished: boolean;
  country: { name: string; iso2: string };
};

export type TelcoPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showingFrom: number;
  showingTo: number;
};

function buildTelcosListHref(page: number, pageSize: number, defaultPageSize: number): string {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  if (pageSize !== defaultPageSize) sp.set("perPage", String(pageSize));
  const q = sp.toString();
  return `/admin/deployments/telcos${q ? `?${q}` : ""}`;
}

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
  telcos: TelcoRow[];
  pagination: TelcoPagination;
  pageSizeOptions: readonly number[];
  /** Must match server default so omitting `perPage` in URLs stays consistent */
  defaultPageSize: number;
  countries: CountryOption[];
  showCreate: boolean;
  /** Server action bound from the parent Server Component */
  createTelco: (formData: FormData) => Promise<void>;
};

export function TelcosDirectoryClient({
  telcos,
  pagination,
  pageSizeOptions,
  defaultPageSize,
  countries,
  showCreate,
  createTelco,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const { page, pageSize, totalCount, totalPages, showingFrom, showingTo } = pagination;
  const canUseCreate = showCreate && countries.length > 0;

  const pagerItems = useMemo(() => pageNumbers(page, totalPages), [page, totalPages]);

  const inputClass =
    "mt-1.5 h-11 w-full rounded-xl border border-keyra-border bg-keyra-bg px-3.5 text-sm text-keyra-primary shadow-sm outline-none transition focus-visible:border-black/25 focus-visible:keyra-focus disabled:opacity-60";
  const selectClass = `${inputClass} bg-keyra-bg`;

  const pageLinkClass =
    "inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition";
  const inactivePageClass = `${pageLinkClass} border-keyra-border bg-keyra-bg text-keyra-primary hover:border-black/20 hover:bg-keyra-surface`;
  const activePageClass = `${pageLinkClass} border-black/25 bg-keyra-bg font-semibold text-keyra-primary ring-1 ring-black/10`;

  return (
    <div>
      {/* Hero */}
      <div className="rounded-3xl border border-keyra-border bg-keyra-surface/60 p-6 shadow-[0_18px_54px_rgba(0,0,0,0.05)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyra-text-2">Deployments</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-keyra-primary">Telcos</h1>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-3 py-1 text-xs font-medium text-keyra-text-2">
                {totalCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-keyra-text-2">
              Full telco catalog — newest additions appear first. Create and edits stay limited by your deployment role.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="/api/admin/deployments/telcos/csv"
              prefetch={false}
              className="inline-flex items-center justify-center rounded-full border border-keyra-border bg-keyra-bg px-4 py-2.5 text-sm font-medium text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
            >
              Download CSV
            </Link>
            {canUseCreate ? (
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ring-1 ${
                  createOpen
                    ? "border border-[var(--keyra-action-border)] bg-keyra-bg text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                    : "bg-[var(--keyra-action)] text-keyra-primary ring-[var(--keyra-action-border)] hover:bg-keyra-surface"
                }`}
                onClick={() => setCreateOpen((open) => !open)}
              >
                {createOpen ? "Close create form" : "Create telco"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Expandable create — fields aligned with `/admin/deployments/telcos/[id]` edit form */}
        {canUseCreate && createOpen ? (
          <div className="mt-8 border-t border-keyra-border pt-8">
            <h2 className="text-lg font-semibold text-keyra-primary">New telco</h2>
            <p className="mt-1 text-sm text-keyra-text-2">
              Same fields as the telco edit screen. Leave Telco subdomain empty to derive it from the country and slug.
            </p>

            <form action={createTelco} className="keyra-card mt-6 space-y-4 p-6">
              <input type="hidden" name="_telcosPageSize" value={pagination.pageSize} />
              <label className="block text-sm text-keyra-text-2">
                Country
                <select name="countryId" required className={selectClass}>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.iso2})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-keyra-text-2">
                Name
                <input name="name" required className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Slug
                <input name="slug" required placeholder="telco-slug" className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Telco subdomain
                <input
                  name="telcoSubdomain"
                  placeholder="Optional — derived from country + slug if empty"
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Official domain
                <input name="officialDomain" className={inputClass} placeholder="example.com" />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Status
                <select name="status" className={selectClass} defaultValue={STATUS_OPTIONS[0]}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-keyra-text-2">
                Status change reason (optional)
                <input
                  name="statusChangeReason"
                  className={inputClass}
                  placeholder="Recorded on initial status history for this telco"
                />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Status note
                <input name="statusNote" className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Subscribers
                <input name="subscribers" type="number" min={0} className={inputClass} placeholder="Numeric count" />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Subscribers display
                <input name="subscribersDisplay" className={inputClass} placeholder='e.g. "120M+"' />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Source label
                <input name="sourceLabel" className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Source URL
                <input name="sourceUrl" type="url" className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Source verified at (ISO)
                <input name="sourceVerifiedAt" type="datetime-local" className={inputClass} />
              </label>
              <label className="block text-sm text-keyra-text-2">
                Sort order
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </label>
              <label className="flex items-center gap-3 text-sm text-keyra-text-2">
                <input name="isPublished" type="checkbox" className="size-4 rounded border-keyra-border accent-keyra-primary" />
                Published
              </label>
              <div className="pt-2">
                <Button type="submit" variant="primary">
                  Create telco
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface/45 shadow-[0_18px_54px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                <th className="px-4 py-3.5">Telco</th>
                <th className="px-4 py-3.5">Country</th>
                <th className="px-4 py-3.5">Subdomain</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Published</th>
                <th className="px-4 py-3.5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {telcos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-keyra-text-2">
                    No telcos in this catalog.
                  </td>
                </tr>
              ) : (
                telcos.map((t) => (
                  <tr key={t.id} className="transition hover:bg-keyra-surface">
                    <td className="px-4 py-3.5 font-medium text-keyra-primary">{t.name}</td>
                    <td className="px-4 py-3.5 text-keyra-text-2">
                      {t.country.name}{" "}
                      <span className="text-keyra-text-2/80">({t.country.iso2})</span>
                    </td>
                    <td className="max-w-[10rem] truncate px-4 py-3.5 font-mono text-xs text-keyra-text-2">{t.telcoSubdomain}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-xs font-medium text-keyra-primary">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-keyra-text-2">{t.isPublished ? "Yes" : "No"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/deployments/telcos/${t.id}`}
                        className="text-sm font-medium text-keyra-accent underline-offset-4 transition hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 ? (
          <div className="flex flex-col gap-4 border-t border-keyra-border bg-keyra-bg/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm text-keyra-text-2">
              Page{" "}
              <span className="font-semibold text-keyra-primary">{page}</span> of{" "}
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
                  <Link
                    key={sz}
                    href={buildTelcosListHref(1, sz, defaultPageSize)}
                    prefetch={false}
                    className={inactivePageClass}
                  >
                    {sz}
                  </Link>
                ),
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={buildTelcosListHref(Math.max(1, page - 1), pageSize, defaultPageSize)}
                prefetch={false}
                aria-disabled={page <= 1}
                className={`${inactivePageClass} ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
              >
                Previous
              </Link>
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
                  <Link
                    key={item}
                    href={buildTelcosListHref(item, pageSize, defaultPageSize)}
                    prefetch={false}
                    className={inactivePageClass}
                  >
                    {item}
                  </Link>
                ),
              )}
              <Link
                href={buildTelcosListHref(Math.min(totalPages, page + 1), pageSize, defaultPageSize)}
                prefetch={false}
                aria-disabled={page >= totalPages}
                className={`${inactivePageClass} ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
              >
                Next
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-6 text-xs leading-5 text-keyra-text-2">
        CSV import: POST the CSV body to{" "}
        <code className="rounded-md bg-keyra-bg px-1.5 py-0.5 font-mono text-[11px] text-keyra-primary">
          /api/admin/deployments/telcos/csv
        </code>
        .
      </p>
    </div>
  );
}
