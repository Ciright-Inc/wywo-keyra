import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createRegion } from "@/app/admin/deployments/actions";
import { canCreateRegion, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { RegionsDirectoryClient, type RegionSortKey } from "./RegionsDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const SORTABLE_COLUMNS = new Set<RegionSortKey>(["name", "slug", "map", "published"]);

type Search = { page?: string; perPage?: string; q?: string; sort?: string; dir?: string };

function parseRegionSort(
  rawSort: string | undefined,
  rawDir: string | undefined,
): { sort: RegionSortKey; dir: "asc" | "desc" } {
  if (!rawSort?.trim()) return { sort: "sortOrder", dir: "asc" };
  const sort = rawSort.trim() as RegionSortKey;
  if (!SORTABLE_COLUMNS.has(sort)) return { sort: "sortOrder", dir: "asc" };
  const dir = rawDir === "asc" || rawDir === "desc" ? rawDir : "asc";
  return { sort, dir };
}

function regionOrderBy(
  sort: RegionSortKey,
  dir: "asc" | "desc",
): Prisma.RegionOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ name: dir }];
    case "slug":
      return [{ slug: dir }, { name: "asc" }];
    case "map":
      return [{ mapKey: dir }, { name: "asc" }];
    case "published":
      return [{ isPublished: dir }, { name: "asc" }];
    case "sortOrder":
    default:
      return [{ sortOrder: dir }, { name: "asc" }];
  }
}

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
  const { sort, dir } = parseRegionSort(sp.sort, sp.dir);

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
    orderBy: regionOrderBy(sort, dir),
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
      sortBy={sort}
      sortDir={dir}
      showCreate={showCreate}
      canDelete={canDelete}
      createRegion={createRegion}
    />
  );
}
