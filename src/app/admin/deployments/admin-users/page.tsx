import type { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { isComplianceReviewer, isGlobal, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { parsePage, parsePageSize, parseSearchQuery } from "@/lib/admin/listSearchParams";
import { AdminUsersDirectoryClient } from "./AdminUsersDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

type Search = { page?: string; perPage?: string; q?: string };

function adminUserSearchWhere(query: string): Prisma.AdminUserWhereInput | undefined {
  const q = query.trim();
  if (!q) return undefined;
  return {
    OR: [
      { displayName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phoneE164: { contains: q, mode: "insensitive" } },
    ],
  };
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE);
  let page = parsePage(sp.page);
  const searchQuery = parseSearchQuery(sp.q);
  const searchWhere = adminUserSearchWhere(searchQuery);

  const auth = await assertAdminServer();
  if (!isGlobal(auth)) notFound();

  const totalCount = await prisma.adminUser.count({ where: searchWhere });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);

  const users = await prisma.adminUser.findMany({
    where: searchWhere,
    orderBy: [{ createdAt: "desc" }, { displayName: "asc" }, { email: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      displayName: true,
      email: true,
      phoneE164: true,
      role: true,
      isActive: true,
    },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  return (
    <AdminUsersDirectoryClient
      users={users.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        phoneE164: u.phoneE164,
        role: u.role,
        isActive: u.isActive,
      }))}
      pagination={{
        page,
        pageSize,
        totalCount,
        totalPages,
        showingFrom,
        showingTo,
      }}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      searchQuery={searchQuery}
      showCreate={canMutate}
      canDelete={canMutate}
    />
  );
}
