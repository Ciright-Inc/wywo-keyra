import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createRegion } from "@/app/admin/deployments/actions";
import { canCreateRegion, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { RegionsDirectoryClient } from "./RegionsDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

type Search = { page?: string; perPage?: string; q?: string };

function regionSearchWhere(query: string): Prisma.RegionWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { mapKey: { contains: q, mode: "insensitive" } },
      { continentCode: { contains: q, mode: "insensitive" } },
      { subregionCode: { contains: q, mode: "insensitive" } },
    ],
  };
}

export default async function AdminRegionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let page = parsePage(sp.page);
  const searchQuery = parseSearchQuery(sp.q);

  const auth = await assertAdminServer();
  const rw = await regionWhereFromAuth(auth);
  const searchWhere = regionSearchWhere(searchQuery);

  /** Combine RBAC scope (`rw`) with optional substring filter (`searchWhere`). */
  const where: Prisma.RegionWhereInput = {
    AND: [rw ?? {}, searchWhere ?? {}].filter((part) => Object.keys(part).length > 0),
  };

  const totalCount = await prisma.region.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);

  const regions = await prisma.region.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const showCreate = auth.kind === "legacy_super" || (auth.kind === "user" && canCreateRegion(auth));
  /** Same gate the DELETE route enforces: read-only and compliance-reviewer roles cannot delete. */
  const canDelete =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  return (
    <RegionsDirectoryClient
      regions={regions.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        mapKey: r.mapKey,
        isPublished: r.isPublished,
      }))}
      pagination={{ page, pageSize, totalCount, totalPages, showingFrom, showingTo }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      showCreate={showCreate}
      canDelete={canDelete}
      createRegion={createRegion}
    />
  );
}
