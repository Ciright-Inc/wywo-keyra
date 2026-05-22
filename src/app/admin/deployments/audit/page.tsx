import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import {
  AuditDirectoryClient,
  type AuditEventSortKey,
  type StatusHistorySortKey,
} from "./AuditDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const EVENT_SORT_COLUMNS = new Set<AuditEventSortKey>(["when", "action", "entityType", "entityId", "actor"]);
const HISTORY_SORT_COLUMNS = new Set<StatusHistorySortKey>([
  "when",
  "targetType",
  "targetId",
  "previous",
  "next",
  "changedBy",
]);

type Search = {
  eq?: string;
  epage?: string;
  eperPage?: string;
  esort?: string;
  edir?: string;
  hq?: string;
  hpage?: string;
  hperPage?: string;
  hsort?: string;
  hdir?: string;
};

function defaultDirForSort<TSort extends string>(sort: TSort, whenKey: TSort): "asc" | "desc" {
  return sort === whenKey ? "desc" : "asc";
}

function parseSectionSort<TSort extends string>(
  rawSort: string | undefined,
  rawDir: string | undefined,
  allowed: Set<TSort>,
  whenKey: TSort,
): { sort: TSort; dir: "asc" | "desc" } {
  const candidate = rawSort?.trim() as TSort | undefined;
  const sort = candidate && allowed.has(candidate) ? candidate : whenKey;
  const dir =
    rawDir === "asc" || rawDir === "desc" ? rawDir : defaultDirForSort(sort, whenKey);
  return { sort, dir };
}

function auditEventSearchWhere(query: string): Prisma.AuditEventWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { action: { contains: q, mode: "insensitive" } },
      { entityType: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
      { actorId: { contains: q, mode: "insensitive" } },
      { actorRole: { contains: q, mode: "insensitive" } },
    ],
  };
}

function statusHistorySearchWhere(query: string): Prisma.StatusHistoryWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { targetId: { contains: q, mode: "insensitive" } },
      { changedBy: { contains: q, mode: "insensitive" } },
      { reason: { contains: q, mode: "insensitive" } },
    ],
  };
}

function auditEventOrderBy(
  sort: AuditEventSortKey,
  dir: "asc" | "desc",
): Prisma.AuditEventOrderByWithRelationInput[] {
  switch (sort) {
    case "action":
      return [{ action: dir }, { createdAt: "desc" }, { id: "asc" }];
    case "entityType":
      return [{ entityType: dir }, { entityId: "asc" }, { createdAt: "desc" }, { id: "asc" }];
    case "entityId":
      return [{ entityId: dir }, { createdAt: "desc" }, { id: "asc" }];
    case "actor":
      return [{ actorRole: dir }, { actorId: dir }, { createdAt: "desc" }, { id: "asc" }];
    case "when":
    default:
      return [{ createdAt: dir }, { id: dir }];
  }
}

function statusHistoryOrderBy(
  sort: StatusHistorySortKey,
  dir: "asc" | "desc",
): Prisma.StatusHistoryOrderByWithRelationInput[] {
  switch (sort) {
    case "targetType":
      return [{ targetType: dir }, { targetId: "asc" }, { changedAt: "desc" }, { id: "asc" }];
    case "targetId":
      return [{ targetId: dir }, { changedAt: "desc" }, { id: "asc" }];
    case "previous":
      return [{ previousStatus: dir }, { changedAt: "desc" }, { id: "asc" }];
    case "next":
      return [{ nextStatus: dir }, { changedAt: "desc" }, { id: "asc" }];
    case "changedBy":
      return [{ changedBy: dir }, { changedAt: "desc" }, { id: "asc" }];
    case "when":
    default:
      return [{ changedAt: dir }, { id: dir }];
  }
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Search> }) {
  await assertAdminServer();
  const sp = await searchParams;

  const ePageSize = parsePageSize(sp.eperPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let ePage = parsePage(sp.epage);
  const eQuery = parseSearchQuery(sp.eq);
  const eWhere = auditEventSearchWhere(eQuery);
  const { sort: eSort, dir: eDir } = parseSectionSort(
    sp.esort,
    sp.edir,
    EVENT_SORT_COLUMNS,
    "when",
  );

  const hPageSize = parsePageSize(sp.hperPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let hPage = parsePage(sp.hpage);
  const hQuery = parseSearchQuery(sp.hq);
  const hWhere = statusHistorySearchWhere(hQuery);
  const { sort: hSort, dir: hDir } = parseSectionSort(
    sp.hsort,
    sp.hdir,
    HISTORY_SORT_COLUMNS,
    "when",
  );

  const [eTotal, hTotal] = await Promise.all([
    prisma.auditEvent.count({ where: eWhere ?? {} }),
    prisma.statusHistory.count({ where: hWhere ?? {} }),
  ]);

  const eTotalPages = Math.max(1, Math.ceil(eTotal / ePageSize));
  ePage = Math.min(ePage, eTotalPages);
  const hTotalPages = Math.max(1, Math.ceil(hTotal / hPageSize));
  hPage = Math.min(hPage, hTotalPages);

  const [events, history] = await Promise.all([
    prisma.auditEvent.findMany({
      where: eWhere ?? {},
      orderBy: auditEventOrderBy(eSort, eDir),
      skip: (ePage - 1) * ePageSize,
      take: ePageSize,
    }),
    prisma.statusHistory.findMany({
      where: hWhere ?? {},
      orderBy: statusHistoryOrderBy(hSort, hDir),
      skip: (hPage - 1) * hPageSize,
      take: hPageSize,
    }),
  ]);

  const eShowingFrom = eTotal === 0 ? 0 : (ePage - 1) * ePageSize + 1;
  const eShowingTo = Math.min(ePage * ePageSize, eTotal);
  const hShowingFrom = hTotal === 0 ? 0 : (hPage - 1) * hPageSize + 1;
  const hShowingTo = Math.min(hPage * hPageSize, hTotal);

  return (
    <AuditDirectoryClient
      events={events.map((a) => ({
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        actorId: a.actorId,
        actorRole: a.actorRole,
      }))}
      history={history.map((h) => ({
        id: h.id,
        changedAt: h.changedAt.toISOString(),
        targetType: h.targetType,
        targetId: h.targetId,
        previousStatus: h.previousStatus,
        nextStatus: h.nextStatus,
        changedBy: h.changedBy,
      }))}
      eventsPagination={{
        page: ePage,
        pageSize: ePageSize,
        totalCount: eTotal,
        totalPages: eTotalPages,
        showingFrom: eShowingFrom,
        showingTo: eShowingTo,
      }}
      historyPagination={{
        page: hPage,
        pageSize: hPageSize,
        totalCount: hTotal,
        totalPages: hTotalPages,
        showingFrom: hShowingFrom,
        showingTo: hShowingTo,
      }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      state={{
        events: { q: eQuery, page: ePage, perPage: ePageSize, sort: eSort, dir: eDir },
        history: { q: hQuery, page: hPage, perPage: hPageSize, sort: hSort, dir: hDir },
      }}
    />
  );
}
