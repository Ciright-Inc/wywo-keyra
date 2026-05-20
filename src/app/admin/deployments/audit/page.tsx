import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { AuditDirectoryClient } from "./AuditDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

type Search = {
  /** Events (Audit events) section URL params. */
  eq?: string;
  epage?: string;
  eperPage?: string;
  /** History (Status history) section URL params. */
  hq?: string;
  hpage?: string;
  hperPage?: string;
};

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

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Search> }) {
  await assertAdminServer();
  const sp = await searchParams;

  const ePageSize = parsePageSize(sp.eperPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let ePage = parsePage(sp.epage);
  const eQuery = parseSearchQuery(sp.eq);
  const eWhere = auditEventSearchWhere(eQuery);

  const hPageSize = parsePageSize(sp.hperPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let hPage = parsePage(sp.hpage);
  const hQuery = parseSearchQuery(sp.hq);
  const hWhere = statusHistorySearchWhere(hQuery);

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
      orderBy: { createdAt: "desc" },
      skip: (ePage - 1) * ePageSize,
      take: ePageSize,
    }),
    prisma.statusHistory.findMany({
      where: hWhere ?? {},
      orderBy: { changedAt: "desc" },
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
      }))}
      history={history.map((h) => ({
        id: h.id,
        changedAt: h.changedAt.toISOString(),
        targetType: h.targetType,
        targetId: h.targetId,
        previousStatus: h.previousStatus,
        nextStatus: h.nextStatus,
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
        events: { q: eQuery, page: ePage, perPage: ePageSize },
        history: { q: hQuery, page: hPage, perPage: hPageSize },
      }}
    />
  );
}
