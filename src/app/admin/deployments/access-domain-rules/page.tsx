import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth, telcoWhereFromAuth } from "@/lib/deployments/adminContext";
import { createAccessDomainRuleFromForm } from "@/app/admin/deployments/actions";
import { canViewScopedTarget, isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { AccessDomainRulesDirectoryClient } from "./AccessDomainRulesDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
/** Same rationale as server-nodes: per-row RBAC post-filter forces in-memory pagination. */
const MAX_PRE_FILTER_ROWS = 1500;

type Search = { page?: string; perPage?: string; q?: string };

function accessDomainRuleSearchWhere(query: string): Prisma.AccessDomainRuleWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { allowedEmailDomain: { contains: q, mode: "insensitive" } },
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

export default async function AdminAccessDomainRulesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let page = parsePage(sp.page);
  const searchQuery = parseSearchQuery(sp.q);

  const auth = await assertAdminServer();
  const searchWhere = accessDomainRuleSearchWhere(searchQuery);

  const raw = await prisma.accessDomainRule.findMany({
    where: searchWhere ?? {},
    orderBy: { updatedAt: "desc" },
    take: MAX_PRE_FILTER_ROWS,
  });

  const visible = [] as typeof raw;
  for (const r of raw) {
    if (await canViewScopedTarget(auth, r.targetType, r.targetId, assetLoaders)) {
      visible.push(r);
    }
  }

  const totalCount = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);
  const skip = (page - 1) * pageSize;
  const pagedRules = visible.slice(skip, skip + pageSize);

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
    <AccessDomainRulesDirectoryClient
      rules={pagedRules.map((r) => ({
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        allowedEmailDomain: r.allowedEmailDomain,
        verificationMethod: r.verificationMethod,
        isActive: r.isActive,
      }))}
      pagination={{ page, pageSize, totalCount, totalPages, showingFrom, showingTo }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      countryOptions={countries.map((c) => ({ id: c.id, label: `${c.name} (${c.iso2})` }))}
      telcoOptions={telcos.map((t) => ({ id: t.id, label: `${t.name} (${t.country.iso2})` }))}
      showCreate={showCreate}
      createAccessDomainRule={createAccessDomainRuleFromForm}
    />
  );
}
