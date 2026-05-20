import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { countryWhereFromAuth } from "@/lib/deployments/adminContext";
import { createTelco } from "@/app/admin/deployments/actions";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { TelcosDirectoryClient } from "./TelcosDirectoryClient";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

type Search = { page?: string; perPage?: string };

function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parsePageSize(raw: string | undefined): number {
  const n = parseInt(raw ?? "", 10);
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number]) ? n : DEFAULT_PAGE_SIZE;
}

export default async function AdminTelcosPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const pageSize = parsePageSize(sp.perPage);
  let page = parsePage(sp.page);

  const auth = await assertAdminServer();

  const cw = await countryWhereFromAuth(auth);
  const [totalCount, countries] = await Promise.all([
    prisma.telcoDeployment.count(),
    prisma.countryDeployment.findMany({
      where: cw ?? {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, iso2: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  page = Math.min(page, totalPages);

  /** Full catalog paging; create/edit still enforced per-row in actions and detail pages. */
  const telcos = await prisma.telcoDeployment.findMany({
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { country: { select: { name: true, iso2: true, id: true } } },
  });

  const canMutate =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  const showCreate = canMutate && countries.length > 0;

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, totalCount);

  return (
    <TelcosDirectoryClient
      telcos={telcos.map((t) => ({
        id: t.id,
        name: t.name,
        telcoSubdomain: t.telcoSubdomain,
        status: t.status,
        isPublished: t.isPublished,
        country: { name: t.country.name, iso2: t.country.iso2 },
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
      countries={countries}
      showCreate={showCreate}
      createTelco={createTelco}
    />
  );
}
