import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createCountry } from "@/app/admin/deployments/actions";
import { DeploymentAdminRole } from "@prisma/client";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { CountriesDirectoryClient } from "./CountriesDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

type Search = { page?: string; perPage?: string; q?: string };

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
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
      }))}
      pagination={{ page, pageSize, totalCount, totalPages, showingFrom, showingTo }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      regions={regions}
      showCreate={showCreate}
      canDelete={canMutate}
      createCountry={createCountry}
    />
  );
}
