import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createCountry } from "@/app/admin/deployments/actions";
import { DeploymentAdminRole } from "@prisma/client";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { CountriesDirectoryClient, type CountrySortKey } from "./CountriesDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const SORTABLE_COLUMNS = new Set<CountrySortKey>(["name", "region", "iso2", "subdomain", "status", "published"]);

type Search = { page?: string; perPage?: string; q?: string; sort?: string; dir?: string };

function parseCountrySort(
  rawSort: string | undefined,
  rawDir: string | undefined,
): { sort: CountrySortKey; dir: "asc" | "desc" } {
  if (!rawSort?.trim()) return { sort: "sortOrder", dir: "asc" };
  const sort = rawSort.trim() as CountrySortKey;
  if (!SORTABLE_COLUMNS.has(sort)) return { sort: "sortOrder", dir: "asc" };
  const dir = rawDir === "asc" || rawDir === "desc" ? rawDir : "asc";
  return { sort, dir };
}

function countryOrderBy(
  sort: CountrySortKey,
  dir: "asc" | "desc",
): Prisma.CountryDeploymentOrderByWithRelationInput[] {
  switch (sort) {
    case "name":
      return [{ name: dir }];
    case "region":
      return [{ region: { name: dir } }, { name: "asc" }];
    case "iso2":
      return [{ iso2: dir }, { name: "asc" }];
    case "subdomain":
      return [{ countrySubdomain: dir }, { name: "asc" }];
    case "status":
      return [{ status: dir }, { name: "asc" }];
    case "published":
      return [{ isPublished: dir }, { name: "asc" }];
    case "sortOrder":
    default:
      return [{ sortOrder: dir }, { name: "asc" }];
  }
}

function countrySearchWhere(query: string): Prisma.CountryDeploymentWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { iso2: { contains: q, mode: "insensitive" } },
      { iso3: { contains: q, mode: "insensitive" } },
      { countrySubdomain: { contains: q, mode: "insensitive" } },
      { officialReferenceDomain: { contains: q, mode: "insensitive" } },
      { statusNote: { contains: q, mode: "insensitive" } },
      { region: { name: { contains: q, mode: "insensitive" } } },
      { region: { slug: { contains: q, mode: "insensitive" } } },
    ],
  };
}

export default async function AdminCountriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let page = parsePage(sp.page);
  const searchQuery = parseSearchQuery(sp.q);
  const { sort, dir } = parseCountrySort(sp.sort, sp.dir);

  const auth = await assertAdminServer();
  const cw = await countryWhereFromAuth(auth);
  const searchWhere = countrySearchWhere(searchQuery);
  const where: Prisma.CountryDeploymentWhereInput = {
    AND: [cw ?? {}, searchWhere ?? {}].filter((part) => Object.keys(part).length > 0),
  };

  const rw = await regionWhereFromAuth(auth);
  const [totalCount, regions] = await Promise.all([
    prisma.countryDeployment.count({ where }),
    prisma.region.findMany({
      where: rw ?? {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);

  const countries = await prisma.countryDeployment.findMany({
    where,
    orderBy: countryOrderBy(sort, dir),
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { region: { select: { name: true, slug: true } } },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showCreate =
    canMutate &&
    regions.length > 0 &&
    (auth.kind === "legacy_super" ||
      (auth.kind === "user" &&
        (auth.user.role === DeploymentAdminRole.GLOBAL_ADMIN ||
          auth.user.role === DeploymentAdminRole.REGIONAL_ADMIN)));

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  return (
    <CountriesDirectoryClient
      countries={countries.map((c) => ({
        id: c.id,
        name: c.name,
        iso2: c.iso2,
        countrySubdomain: c.countrySubdomain,
        status: c.status,
        isPublished: c.isPublished,
        region: { name: c.region.name, slug: c.region.slug },
      }))}
      pagination={{ page, pageSize, totalCount, totalPages, showingFrom, showingTo }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      sortBy={sort}
      sortDir={dir}
      regions={regions}
      showCreate={showCreate}
      canDelete={canMutate}
      createCountry={createCountry}
    />
  );
}
