/**
 * Shared parser for admin list-page URL params (`?page=`, `?perPage=`, `?q=`).
 *
 * Centralized so every directory tab uses the same pagination semantics:
 * - `page` defaults to 1, clamps to the calculated total (callers do the final clamp
 *   after counting matches).
 * - `perPage` only accepts values from the page's `PAGE_SIZE_OPTIONS` whitelist
 *   (defends against rogue URLs claiming `perPage=99999`).
 * - `q` is trimmed and capped at SEARCH_QUERY_MAX_LEN so a runaway URL can't blow
 *   up the Postgres planner.
 */

export const SEARCH_QUERY_MAX_LEN = 120;

export function parseSearchQuery(raw: string | undefined): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s.slice(0, SEARCH_QUERY_MAX_LEN);
}

export function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parsePageSize(
  raw: string | undefined,
  options: readonly number[],
  fallback: number,
): number {
  const n = parseInt(raw ?? "", 10);
  return options.includes(n) ? n : fallback;
}

export type ListUrlState = {
  page: number;
  pageSize: number;
  searchQuery: string;
};

/**
 * Convenience builder that produces a list-page href preserving `q`, `page`, `perPage`.
 * - Empty `q` is omitted.
 * - `page === 1` is omitted.
 * - `pageSize === defaultPageSize` is omitted (canonical URL stays short).
 *
 * Use this directly in your client component to avoid drift between search & pagination link
 * builders.
 */
export function buildListHref(
  baseHref: string,
  state: ListUrlState,
  defaultPageSize: number,
  extra?: Record<string, string | number | undefined>,
): string {
  const sp = new URLSearchParams();
  const q = state.searchQuery.trim();
  if (q) sp.set("q", q);
  if (state.page > 1) sp.set("page", String(state.page));
  if (state.pageSize !== defaultPageSize) sp.set("perPage", String(state.pageSize));
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined || v === "" || v === null) continue;
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return `${baseHref}${qs ? `?${qs}` : ""}`;
}
