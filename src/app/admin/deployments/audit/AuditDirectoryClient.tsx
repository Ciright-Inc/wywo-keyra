"use client";

import { useCallback } from "react";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";

export type AuditEventRow = {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: string;
};

export type StatusHistoryRow = {
  id: string;
  changedAt: string;
  targetType: string;
  targetId: string;
  previousStatus: string | null;
  nextStatus: string;
};

type AuditSearchKeys = {
  events: { q: string; page: number; perPage: number };
  history: { q: string; page: number; perPage: number };
};

type Props = {
  events: AuditEventRow[];
  history: StatusHistoryRow[];
  eventsPagination: TablePaginationMeta;
  historyPagination: TablePaginationMeta;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  /** URL params for each section, used to preserve the other section's state when paginating one. */
  state: AuditSearchKeys;
};

const BASE_HREF = "/admin/deployments/audit";

function buildAuditHref(state: AuditSearchKeys, defaultPageSize: number): string {
  const sp = new URLSearchParams();
  const { events, history } = state;
  if (events.q.trim()) sp.set("eq", events.q.trim());
  if (events.page > 1) sp.set("epage", String(events.page));
  if (events.perPage !== defaultPageSize) sp.set("eperPage", String(events.perPage));
  if (history.q.trim()) sp.set("hq", history.q.trim());
  if (history.page > 1) sp.set("hpage", String(history.page));
  if (history.perPage !== defaultPageSize) sp.set("hperPage", String(history.perPage));
  const qs = sp.toString();
  return `${BASE_HREF}${qs ? `?${qs}` : ""}`;
}

export function AuditDirectoryClient({
  events,
  history,
  eventsPagination,
  historyPagination,
  pageSizeOptions,
  defaultPageSize,
  state,
}: Props) {
  const hasEventsSearch = state.events.q.trim().length > 0;
  const hasHistorySearch = state.history.q.trim().length > 0;

  const buildEventsSearchHref = useCallback(
    (query: string) =>
      buildAuditHref(
        {
          ...state,
          events: { q: query, page: 1, perPage: state.events.perPage },
        },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  const buildEventsPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildAuditHref(
        {
          ...state,
          events: { q: state.events.q, page: nextPage, perPage: nextPageSize },
        },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  const buildHistorySearchHref = useCallback(
    (query: string) =>
      buildAuditHref(
        {
          ...state,
          history: { q: query, page: 1, perPage: state.history.perPage },
        },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  const buildHistoryPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildAuditHref(
        {
          ...state,
          history: { q: state.history.q, page: nextPage, perPage: nextPageSize },
        },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  return (
    <div>
      <div className="rounded-2xl border border-keyra-border bg-keyra-surface/60 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Audit</h1>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
            Immutable-style audit trail and status transitions. Each section searches and pages independently.
          </p>
        </div>
      </div>

      {/* Audit events */}
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-keyra-text-2">Audit events</h2>
            <span className="rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-[11px] font-medium text-keyra-text-2">
              {eventsPagination.totalCount.toLocaleString()} total
            </span>
          </div>
          <CollapsibleSearchBar
            searchQuery={state.events.q}
            buildHref={buildEventsSearchHref}
            placeholder="Action, entity, actor…"
            ariaLabel="Search audit events"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-keyra-border bg-keyra-surface/45 shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-sm text-keyra-text-2">
                      {hasEventsSearch
                        ? "No audit events match your search."
                        : "No audit events recorded yet."}
                    </td>
                  </tr>
                ) : (
                  events.map((a) => (
                    <tr key={a.id} className="transition hover:bg-keyra-surface">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-keyra-text-2">
                        {a.createdAt}
                      </td>
                      <td className="px-3 py-2 font-medium text-keyra-primary">{a.action}</td>
                      <td className="max-w-[22rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {a.entityType} · {a.entityId}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            {...eventsPagination}
            pageSizeOptions={pageSizeOptions}
            buildHref={buildEventsPaginationHref}
          />
        </div>
      </div>

      {/* Status history */}
      <div className="mt-8">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-keyra-text-2">Status history</h2>
            <span className="rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-[11px] font-medium text-keyra-text-2">
              {historyPagination.totalCount.toLocaleString()} total
            </span>
          </div>
          <CollapsibleSearchBar
            searchQuery={state.history.q}
            buildHref={buildHistorySearchHref}
            placeholder="Target id, changed by, reason…"
            ariaLabel="Search status history"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-keyra-border bg-keyra-surface/45 shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-sm text-keyra-text-2">
                      {hasHistorySearch
                        ? "No status history rows match your search."
                        : "No status history recorded yet."}
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="transition hover:bg-keyra-surface">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-keyra-text-2">
                        {h.changedAt}
                      </td>
                      <td className="max-w-[22rem] truncate px-3 py-2 font-mono text-xs text-keyra-text-2">
                        {h.targetType} · {h.targetId}
                      </td>
                      <td className="px-3 py-2 text-keyra-text-2">
                        {h.previousStatus ?? "—"} → {h.nextStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            {...historyPagination}
            pageSizeOptions={pageSizeOptions}
            buildHref={buildHistoryPaginationHref}
          />
        </div>
      </div>
    </div>
  );
}
