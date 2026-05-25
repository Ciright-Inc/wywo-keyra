"use client";

import { useCallback } from "react";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectoryPageHeader, AdminDirectorySectionTitleRow } from "@/components/admin/AdminDirectoryPageHeader";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { TablePagination, type TablePaginationMeta } from "@/components/admin/TablePagination";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import { useAdminRouteTransition } from "@/lib/admin/useAdminRouteTransition";
import {
  adminCountBadge,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
  adminToolbarMeta,
} from "@/lib/admin/adminUiClasses";

export type AuditEventSortKey = "when" | "action" | "entityType" | "entityId" | "actor";
export type StatusHistorySortKey = "when" | "targetType" | "targetId" | "previous" | "next" | "changedBy";

export type AuditEventRow = {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorRole: string | null;
};

export type StatusHistoryRow = {
  id: string;
  changedAt: string;
  targetType: string;
  targetId: string;
  previousStatus: string | null;
  nextStatus: string;
  changedBy: string;
};

type AuditSectionState<TSort extends string> = {
  q: string;
  page: number;
  perPage: number;
  sort: TSort;
  dir: "asc" | "desc";
};

type AuditSearchKeys = {
  events: AuditSectionState<AuditEventSortKey>;
  history: AuditSectionState<StatusHistorySortKey>;
};

type Props = {
  events: AuditEventRow[];
  history: StatusHistoryRow[];
  eventsPagination: TablePaginationMeta;
  historyPagination: TablePaginationMeta;
  pageSizeOptions: readonly number[];
  defaultPageSize: number;
  state: AuditSearchKeys;
};

const BASE_HREF = "/admin/deployments/audit";

const EVENT_SORT_LABELS: Record<AuditEventSortKey, string> = {
  when: "When",
  action: "Action",
  entityType: "Entity type",
  entityId: "Entity ID",
  actor: "Actor",
};

const HISTORY_SORT_LABELS: Record<StatusHistorySortKey, string> = {
  when: "When",
  targetType: "Target type",
  targetId: "Target ID",
  previous: "Previous status",
  next: "Next status",
  changedBy: "Changed by",
};

function appendEventsParams(sp: URLSearchParams, events: AuditSectionState<AuditEventSortKey>, defaultPageSize: number) {
  if (events.q.trim()) sp.set("eq", events.q.trim());
  if (events.page > 1) sp.set("epage", String(events.page));
  if (events.perPage !== defaultPageSize) sp.set("eperPage", String(events.perPage));
  sp.set("esort", events.sort);
  sp.set("edir", events.dir);
}

function appendHistoryParams(
  sp: URLSearchParams,
  history: AuditSectionState<StatusHistorySortKey>,
  defaultPageSize: number,
) {
  if (history.q.trim()) sp.set("hq", history.q.trim());
  if (history.page > 1) sp.set("hpage", String(history.page));
  if (history.perPage !== defaultPageSize) sp.set("hperPage", String(history.perPage));
  sp.set("hsort", history.sort);
  sp.set("hdir", history.dir);
}

function buildAuditHref(state: AuditSearchKeys, defaultPageSize: number): string {
  const sp = new URLSearchParams();
  appendEventsParams(sp, state.events, defaultPageSize);
  appendHistoryParams(sp, state.history, defaultPageSize);
  const qs = sp.toString();
  return `${BASE_HREF}${qs ? `?${qs}` : ""}`;
}

function nextSortState<TSort extends string>(
  column: TSort,
  sortBy: TSort,
  sortDir: "asc" | "desc",
  whenKey: TSort,
): { sort: TSort; dir: "asc" | "desc" } {
  if (sortBy === column) return { sort: column, dir: sortDir === "asc" ? "desc" : "asc" };
  return { sort: column, dir: column === whenKey ? "desc" : "asc" };
}

function sortSummary<TSort extends string>(
  sort: TSort,
  dir: "asc" | "desc",
  labels: Record<TSort, string>,
  whenKey: TSort,
): string {
  const label = labels[sort];
  if (sort === whenKey) {
    return dir === "desc" ? `Sorted by ${label} (newest first)` : `Sorted by ${label} (oldest first)`;
  }
  return dir === "asc" ? `Sorted by ${label} (A → Z)` : `Sorted by ${label} (Z → A)`;
}

function formatActor(actorRole: string | null, actorId: string | null): string {
  if (actorRole && actorId) return `${actorRole} · ${actorId}`;
  return actorRole ?? actorId ?? "—";
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
  const { isPending, navigate } = useAdminRouteTransition();
  const hasEventsSearch = state.events.q.trim().length > 0;
  const hasHistorySearch = state.history.q.trim().length > 0;

  const buildEventsSearchHref = useCallback(
    (query: string) =>
      buildAuditHref({ ...state, events: { ...state.events, q: query, page: 1 } }, defaultPageSize),
    [state, defaultPageSize],
  );

  const buildEventsPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildAuditHref(
        { ...state, events: { ...state.events, page: nextPage, perPage: nextPageSize } },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  const buildHistorySearchHref = useCallback(
    (query: string) =>
      buildAuditHref({ ...state, history: { ...state.history, q: query, page: 1 } }, defaultPageSize),
    [state, defaultPageSize],
  );

  const buildHistoryPaginationHref = useCallback(
    (nextPage: number, nextPageSize: number) =>
      buildAuditHref(
        { ...state, history: { ...state.history, page: nextPage, perPage: nextPageSize } },
        defaultPageSize,
      ),
    [state, defaultPageSize],
  );

  function eventsSortHref(column: AuditEventSortKey): string {
    const next = nextSortState(column, state.events.sort, state.events.dir, "when");
    return buildAuditHref({ ...state, events: { ...state.events, ...next, page: 1 } }, defaultPageSize);
  }

  function historySortHref(column: StatusHistorySortKey): string {
    const next = nextSortState(column, state.history.sort, state.history.dir, "when");
    return buildAuditHref({ ...state, history: { ...state.history, ...next, page: 1 } }, defaultPageSize);
  }

  function eventsSortIndicator(column: AuditEventSortKey): string {
    if (state.events.sort !== column) return "";
    return state.events.dir === "asc" ? " ↑" : " ↓";
  }

  function historySortIndicator(column: StatusHistorySortKey): string {
    if (state.history.sort !== column) return "";
    return state.history.dir === "asc" ? " ↑" : " ↓";
  }

  const eventsSortableTh = (label: string, column: AuditEventSortKey) => (
    <th aria-sort={state.events.sort === column ? (state.events.dir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink href={eventsSortHref(column)} onNavigate={navigate} className="ds-table-sort">
        {label}
        <span aria-hidden>{eventsSortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  const historySortableTh = (label: string, column: StatusHistorySortKey) => (
    <th aria-sort={state.history.sort === column ? (state.history.dir === "asc" ? "ascending" : "descending") : "none"}>
      <AdminTransitionLink href={historySortHref(column)} onNavigate={navigate} className="ds-table-sort">
        {label}
        <span aria-hidden>{historySortIndicator(column)}</span>
      </AdminTransitionLink>
    </th>
  );

  return (
    <div>
      <div className={adminPanel}>
        <AdminDirectoryPageHeader
          title="Audit"
          badge={<span className={adminCountBadge}>{eventsPagination.totalCount.toLocaleString()} events</span>}
          description="Review who changed what across the deployment registry. Click any column header to sort. Search, sort, and pagination are independent for each table below."
          search={
            <CollapsibleSearchBar
              searchQuery={state.events.q}
              buildHref={buildEventsSearchHref}
              placeholder="Action, entity, actor…"
              ariaLabel="Search audit events"
            />
          }
        />
      </div>

      {/* Audit events */}
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={adminSectionTitle}>Audit events</h2>
            <span className={adminCountBadge}>{eventsPagination.totalCount.toLocaleString()} total</span>
          </div>
          <span className={adminToolbarMeta}>
            {sortSummary(state.events.sort, state.events.dir, EVENT_SORT_LABELS, "when")}
          </span>
        </div>
        <div className={`${adminTableWrap} transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
          <div className={adminTableScroll}>
            <table className={`${adminTable} min-w-[52rem]`}>
              <thead>
                <tr>
                  {eventsSortableTh("When", "when")}
                  {eventsSortableTh("Action", "action")}
                  {eventsSortableTh("Entity type", "entityType")}
                  {eventsSortableTh("Entity ID", "entityId")}
                  {eventsSortableTh("Actor", "actor")}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <AdminListEmptyState
                    variant="table-row"
                    colSpan={5}
                    hasSearch={hasEventsSearch}
                    entityName="audit events"
                  />
                ) : (
                  events.map((a) => (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap text-[13px] is-muted" title={a.createdAt}>
                        {formatAdminDateTime(a.createdAt)}
                      </td>
                      <td>
                        <span className="ds-status-pill">{a.action}</span>
                      </td>
                      <td className="font-mono text-xs">{a.entityType}</td>
                      <td className="max-w-[14rem] truncate font-mono text-xs is-muted" title={a.entityId}>
                        {a.entityId}
                      </td>
                      <td className="max-w-[12rem] truncate text-sm is-muted" title={formatActor(a.actorRole, a.actorId)}>
                        {formatActor(a.actorRole, a.actorId)}
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
            onNavigate={navigate}
          />
        </div>
      </div>

      {/* Status history */}
      <div className="mt-8">
        <div className="mb-2">
          <AdminDirectorySectionTitleRow
            search={
              <CollapsibleSearchBar
                searchQuery={state.history.q}
                buildHref={buildHistorySearchHref}
                placeholder="Target id, changed by, reason…"
                ariaLabel="Search status history"
              />
            }
          >
            <h2 className={adminSectionTitle}>Status history</h2>
            <span className={adminCountBadge}>{historyPagination.totalCount.toLocaleString()} total</span>
          </AdminDirectorySectionTitleRow>
          <span className={`${adminToolbarMeta} mt-2 inline-flex`}>
            {sortSummary(state.history.sort, state.history.dir, HISTORY_SORT_LABELS, "when")}
          </span>
        </div>
        <div className={`${adminTableWrap} transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
          <div className={adminTableScroll}>
            <table className={`${adminTable} min-w-[56rem]`}>
              <thead>
                <tr>
                  {historySortableTh("When", "when")}
                  {historySortableTh("Target type", "targetType")}
                  {historySortableTh("Target ID", "targetId")}
                  {historySortableTh("Previous", "previous")}
                  {historySortableTh("Next", "next")}
                  {historySortableTh("Changed by", "changedBy")}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <AdminListEmptyState
                    variant="table-row"
                    colSpan={6}
                    hasSearch={hasHistorySearch}
                    entityName="status history"
                  />
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td className="whitespace-nowrap text-[13px] is-muted" title={h.changedAt}>
                        {formatAdminDateTime(h.changedAt)}
                      </td>
                      <td className="font-mono text-xs">{h.targetType}</td>
                      <td className="max-w-[14rem] truncate font-mono text-xs is-muted" title={h.targetId}>
                        {h.targetId}
                      </td>
                      <td className="is-muted">{h.previousStatus ?? "—"}</td>
                      <td>
                        <span className="ds-status-pill">{h.nextStatus}</span>
                      </td>
                      <td className="max-w-[12rem] truncate text-sm is-muted" title={h.changedBy}>
                        {h.changedBy}
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
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
