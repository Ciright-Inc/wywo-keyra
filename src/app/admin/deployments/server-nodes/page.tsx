import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { createServerNodeFromForm } from "@/app/admin/deployments/actions";
import { canViewScopedTarget, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { ServerNodesDirectoryClient } from "./ServerNodesDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
/**
 * Per-row RBAC post-filter (`canViewScopedTarget`) cannot be expressed as a Prisma `where`,
 * so we still pull up to this many matches and filter in memory before paginating. Keeps
 * the legacy ceiling but is now narrowed first by the user's search query.
 */
const MAX_PRE_FILTER_ROWS = 1000;

type Search = { page?: string; perPage?: string; q?: string };

function serverNodeSearchWhere(query: string): Prisma.ServerNodeWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { fqdn: { contains: q, mode: "insensitive" } },
      { healthcheckUrl: { contains: q, mode: "insensitive" } },
      { targetId: { contains: q, mode: "insensitive" } },
    ],
  };
}

const assetLoaders = {
  country: (cid: string) =>
    prisma.countryDeployment.findUnique({ where: { id: cid }, select: { id: true, regionId: true } }),
  telco: (tid: string) =>
    prisma.telcoDeployment.findUnique({
      where: { id: tid },
      select: { id: true, countryId: true, country: { select: { id: true, regionId: true } } },
    }),
};

export default async function AdminServerNodesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let page = parsePage(sp.page);
  const searchQuery = parseSearchQuery(sp.q);

  const auth = await assertAdminServer();
  const searchWhere = serverNodeSearchWhere(searchQuery);

  /**
   * Step 1: pull rows that match the user's query (search is at the DB layer for speed).
   * Step 2: post-filter by RBAC scope using `canViewScopedTarget`.
   * Step 3: paginate the visible subset.
   */
  const raw = await prisma.serverNode.findMany({
    where: searchWhere ?? {},
    orderBy: { updatedAt: "desc" },
    take: MAX_PRE_FILTER_ROWS,
  });

  const visible = [] as typeof raw;
  for (const n of raw) {
    if (await canViewScopedTarget(auth, n.targetType, n.targetId, assetLoaders)) {
      visible.push(n);
    }
  }

  const totalCount = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);
  const skip = (page - 1) * pageSize;
  const pagedNodes = visible.slice(skip, skip + pageSize);

  const cw = await countryWhereFromAuth(auth);
  const countries = await prisma.countryDeployment.findMany({
    where: cw ?? {},
    orderBy: { name: "asc" },
    select: { id: true, name: true, iso2: true },
  });
  const tw = await telcoWhereFromAuth(auth);
  const telcos = await prisma.telcoDeployment.findMany({
    where: tw ?? {},
    orderBy: { name: "asc" },
    include: { country: { select: { iso2: true } } },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));
  const showCreate = canMutate && (countries.length > 0 || telcos.length > 0);

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  return (
    <ServerNodesDirectoryClient
      nodes={pagedNodes.map((n) => ({
        id: n.id,
        fqdn: n.fqdn,
        environment: n.environment,
        targetType: n.targetType,
        targetId: n.targetId,
        status: n.status,
      }))}
      pagination={{ page, pageSize, totalCount, totalPages, showingFrom, showingTo }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      countryOptions={countries.map((c) => ({ id: c.id, label: `${c.name} (${c.iso2})` }))}
      telcoOptions={telcos.map((t) => ({ id: t.id, label: `${t.name} (${t.country.iso2})` }))}
      showCreate={showCreate}
      canDelete={canMutate}
      createServerNode={createServerNodeFromForm}
    />
  );
}
