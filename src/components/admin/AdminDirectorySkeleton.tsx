export type AdminSkeletonTab =
  | "deployments-overview"
  | "deployments-regions"
  | "deployments-countries"
  | "deployments-telcos"
  | "deployments-apps"
  | "deployments-server-nodes"
  | "deployments-access-domain-rules"
  | "deployments-access-requests"
  | "deployments-admin-users"
  | "deployments-audit"
  | "auth-countries"
  | "auth-protocols"
  | "auth-settings";

type Props = {
  tab: AdminSkeletonTab;
  /** When true, only render the data table/grid area (for in-page refetch). */
  tableOnly?: boolean;
  rows?: number;
};

function SkeletonBar({ className }: { className: string }) {
  return <div className={`keyra-skeleton ${className}`} aria-hidden />;
}

function DeploymentsPanelHeader({
  titleWidth,
  showCsv,
  showCreate,
}: {
  titleWidth: string;
  showCsv?: boolean;
  showCreate?: boolean;
}) {
  return (
    <div className="ds-panel is-dashboard">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBar className={`h-7 sm:h-8 ${titleWidth}`} />
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBar className="mt-2 h-4 w-full max-w-xl" />
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <SkeletonBar className="h-9 w-44 rounded-full sm:w-52" />
          {showCsv ? <SkeletonBar className="h-9 w-28 rounded-full" /> : null}
          {showCreate ? <SkeletonBar className="h-9 w-32 rounded-full" /> : null}
        </div>
      </div>
    </div>
  );
}

function DeploymentsTable({
  columnWidths,
  rows = 8,
}: {
  columnWidths: string[];
  rows?: number;
}) {
  return (
    <div className="ds-table-wrap mt-3 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
            <tr>
              {columnWidths.map((width, i) => (
                <th key={i} className={`px-3 py-2 ${i === columnWidths.length - 1 ? "text-right" : ""}`}>
                  <SkeletonBar className={`h-3 ${width}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
            {Array.from({ length: rows }, (_, row) => (
              <tr key={row}>
                {columnWidths.map((width, col) => (
                  <td key={col} className={`px-3 py-2 ${col === columnWidths.length - 1 ? "text-right" : ""}`}>
                    <SkeletonBar className={`h-4 ${col === 0 ? "w-36" : width}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-keyra-border bg-keyra-bg/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <SkeletonBar className="h-4 w-44" />
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-9 w-14 rounded-xl" />
          <SkeletonBar className="h-9 w-14 rounded-xl" />
          <SkeletonBar className="h-9 w-14 rounded-xl" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-9 w-20 rounded-xl" />
          <SkeletonBar className="h-9 w-8 rounded-xl" />
          <SkeletonBar className="h-9 w-8 rounded-xl" />
          <SkeletonBar className="h-9 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function AccessRequestsTable({ rows = 6 }: { rows?: number }) {
  const columns = ["w-20", "w-36", "w-28", "w-16", "w-16", "w-20"];
  return (
    <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
          <tr>
            {columns.map((width, i) => (
              <th key={i} className={`px-3 py-2 ${i === columns.length - 1 ? "text-right" : ""}`}>
                <SkeletonBar className={`h-3 ${width}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-keyra-border">
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {columns.map((width, col) => (
                <td key={col} className={`px-3 py-3 ${col === columns.length - 1 ? "text-right" : ""}`}>
                  <SkeletonBar className={`h-4 ${col === 1 ? "w-40" : width}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessRequestsHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-8 w-44" />
          <SkeletonBar className="h-5 w-10 rounded-full" />
        </div>
        <SkeletonBar className="mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBar className="h-9 w-9 rounded-full" />
        <SkeletonBar className="h-9 w-20 rounded-full" />
      </div>
    </div>
  );
}

function AppsHeader() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 py-1">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBar className="h-8 w-20" />
          <SkeletonBar className="h-7 w-10 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className="h-9 w-9 rounded-full" />
          <SkeletonBar className="h-9 w-36 rounded-full" />
        </div>
      </div>
      <SkeletonBar className="mt-2 h-4 w-full max-w-lg" />
    </div>
  );
}

function AppsGrid({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SkeletonBar className="h-4 w-16" />
        <SkeletonBar className="h-10 w-48 rounded-2xl" />
      </div>
      <div className="mt-6 rounded-3xl border border-keyra-border bg-keyra-surface/45 p-2.5 shadow-[0_18px_54px_rgba(0,0,0,0.04)] sm:p-3">
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="rounded-2xl border border-keyra-border bg-keyra-surface/70 px-3 py-3 sm:px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <SkeletonBar className="size-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SkeletonBar className="h-4 w-24" />
                      <SkeletonBar className="h-5 w-16 rounded-full" />
                    </div>
                    <SkeletonBar className="h-3 w-full max-w-[14rem]" />
                    <SkeletonBar className="h-3 w-full max-w-[11rem]" />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <SkeletonBar className="size-7 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <SkeletonBar className="size-8 rounded-md" />
                    <SkeletonBar className="size-8 rounded-md" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function AuditSection({ titleWidth, columns, rows = 5 }: { titleWidth: string; columns: string[]; rows?: number }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBar className={`h-4 ${titleWidth}`} />
          <SkeletonBar className="h-5 w-14 rounded-full" />
        </div>
        <SkeletonBar className="h-9 w-44 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-keyra-border bg-keyra-surface/45 shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
              <tr>
                {columns.map((width, i) => (
                  <th key={i} className="px-3 py-2">
                    <SkeletonBar className={`h-3 ${width}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-keyra-border bg-keyra-surface/70">
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row}>
                  {columns.map((width, col) => (
                    <td key={col} className="px-3 py-2">
                      <SkeletonBar className={`h-4 ${col === 0 ? "w-28" : width}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-keyra-border bg-keyra-bg/50 px-3 py-3">
          <SkeletonBar className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

function AuthHeroHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <SkeletonBar className="h-9 w-64 max-w-full sm:w-80" />
          <SkeletonBar className="h-4 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
            <SkeletonBar className="h-3 w-10" />
            <SkeletonBar className="mt-3 h-8 w-12" />
          </div>
          <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
            <SkeletonBar className="h-3 w-12" />
            <SkeletonBar className="mt-3 h-8 w-12" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthToolbar({ buttonCount = 4 }: { buttonCount?: number }) {
  return (
    <div className="sticky top-[var(--keyra-header-offset)] z-20 flex flex-col gap-3 rounded-2xl border border-keyra-border bg-keyra-surface/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:px-4 lg:top-14">
      <div className="flex min-w-0 w-full flex-1 flex-wrap items-center gap-3">
        <SkeletonBar className="h-9 w-24 rounded-md" />
        <SkeletonBar className="h-9 w-24 rounded-md" />
        <SkeletonBar className="h-9 w-28 rounded-md" />
        <SkeletonBar className="h-6 w-28 rounded-full" />
      </div>
      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
        <SkeletonBar className="size-9 rounded-lg" />
        {Array.from({ length: buttonCount }, (_, i) => (
          <SkeletonBar key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function AuthWideTable({ rows = 8 }: { rows?: number }) {
  const columns = ["w-8", "w-24", "w-20", "w-10", "w-10", "w-16", "w-12", "w-12", "w-10", "w-10", "w-8", "w-8", "w-8", "w-10", "w-12"];
  return (
    <div className="max-h-[min(85vh,calc(100dvh-11rem))] min-h-[260px] overflow-auto rounded-2xl border border-keyra-border bg-keyra-surface/50 shadow-[0_18px_54px_rgba(0,0,0,0.05)]">
      <table className="min-w-[1200px] w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 border-b border-keyra-border bg-keyra-bg/95 backdrop-blur-sm">
          <tr>
            {columns.map((width, i) => (
              <th key={i} className={`px-2 py-2.5 ${i === 0 ? "pl-4" : ""}`}>
                <SkeletonBar className={`h-3 ${i === 0 ? "size-3.5 rounded" : width}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-keyra-border/50">
              {columns.map((width, col) => (
                <td key={col} className={`px-2 py-2 ${col === 0 ? "pl-4" : ""}`}>
                  <SkeletonBar className={`h-8 ${col === 0 ? "size-3.5 rounded" : col <= 2 ? "w-24" : "w-12"}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuthProtocolsTable({ rows = 8 }: { rows?: number }) {
  const columns = ["w-8", "w-10", "w-28", "w-16", "w-20", "w-10", "w-10", "w-10", "w-10", "w-16", "w-10", "w-10", "w-10"];
  return (
    <div className="max-h-[min(85vh,calc(100dvh-var(--keyra-header-offset)-8rem))] min-h-[260px] overflow-auto overscroll-x-contain rounded-2xl border border-keyra-border bg-keyra-surface/50 shadow-[0_18px_54px_rgba(0,0,0,0.05)]">
      <table className="min-w-[1100px] w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 z-10 border-b border-keyra-border bg-keyra-bg/95 backdrop-blur-sm">
          <tr>
            {columns.map((width, i) => (
              <th key={i} className={`px-1.5 py-2.5 ${i === 0 ? "pl-4" : ""}`}>
                <SkeletonBar className={`h-3 ${i === 1 ? "w-8" : width}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-b border-keyra-border/50">
              <td className="pl-4 pr-2 py-1">
                <SkeletonBar className="size-3.5 rounded" />
              </td>
              <td className="px-1 py-1">
                <SkeletonBar className="size-9 rounded-md" />
              </td>
              {columns.slice(2).map((width, col) => (
                <td key={col} className="px-1 py-1">
                  <SkeletonBar className={`h-8 ${col === 0 ? "w-28" : width}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <SkeletonBar className="h-3 w-36" />
            <SkeletonBar className="h-10 w-72 max-w-full sm:h-11" />
            <SkeletonBar className="h-4 w-full max-w-xl" />
            <SkeletonBar className="mt-1 h-4 w-full max-w-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <SkeletonBar className="h-10 w-32 rounded-full" />
            <SkeletonBar className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-keyra-border bg-keyra-surface/75 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <SkeletonBar className="h-3 w-20" />
                <SkeletonBar className="h-10 w-14" />
              </div>
              <SkeletonBar className="h-7 w-14 rounded-full" />
            </div>
            <SkeletonBar className="mt-4 h-4 w-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="rounded-2xl border border-keyra-border bg-keyra-surface/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <SkeletonBar className="h-5 w-40" />
              <SkeletonBar className="h-4 w-64 max-w-full" />
            </div>
            <SkeletonBar className="h-7 w-44 rounded-full" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SkeletonBar className="h-11 rounded-xl" />
            <SkeletonBar className="h-11 rounded-xl" />
            <SkeletonBar className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-keyra-border bg-keyra-bg p-5">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="mt-3 h-6 w-48" />
          <SkeletonBar className="mt-2 h-4 w-full" />
          <SkeletonBar className="mt-2 h-4 w-full max-w-sm" />
          <SkeletonBar className="mt-5 h-10 w-32 rounded-full" />
        </div>
      </section>
    </div>
  );
}

function AdminUsersHeader() {
  return (
    <div className="ds-panel is-dashboard">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBar className="h-7 w-32 sm:h-8" />
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBar className="mt-2 h-4 w-full max-w-md" />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <SkeletonBar className="size-9 rounded-lg" />
          <SkeletonBar className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function AuthSettingsSkeleton() {
  return (
    <div className="max-w-xl space-y-4">
      <SkeletonBar className="h-8 w-64" />
      <div className="space-y-3">
        <SkeletonBar className="h-5 w-28" />
        <SkeletonBar className="h-5 w-32" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="mt-1 h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <SkeletonBar className="h-10 w-32 rounded-full" />
    </div>
  );
}

function renderTabSkeleton(tab: AdminSkeletonTab, rows: number, tableOnly: boolean) {
  switch (tab) {
    case "deployments-overview":
      return <OverviewSkeleton />;

    case "deployments-regions":
      return (
        <>
          {!tableOnly ? <DeploymentsPanelHeader titleWidth="w-24" showCreate /> : null}
          <DeploymentsTable columnWidths={["w-16", "w-12", "w-12", "w-14", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-countries":
      return (
        <>
          {!tableOnly ? <DeploymentsPanelHeader titleWidth="w-28" showCsv showCreate /> : null}
          <DeploymentsTable columnWidths={["w-20", "w-24", "w-10", "w-24", "w-16", "w-14", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-telcos":
      return (
        <>
          {!tableOnly ? <DeploymentsPanelHeader titleWidth="w-20" showCsv showCreate /> : null}
          <DeploymentsTable columnWidths={["w-20", "w-24", "w-20", "w-16", "w-14", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-server-nodes":
      return (
        <>
          {!tableOnly ? <DeploymentsPanelHeader titleWidth="w-32" showCreate /> : null}
          <DeploymentsTable columnWidths={["w-28", "w-12", "w-32", "w-16", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-access-domain-rules":
      return (
        <>
          {!tableOnly ? <DeploymentsPanelHeader titleWidth="w-36" showCreate /> : null}
          <DeploymentsTable columnWidths={["w-32", "w-24", "w-16", "w-12", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-admin-users":
      return (
        <>
          {!tableOnly ? <AdminUsersHeader /> : null}
          <DeploymentsTable columnWidths={["w-24", "w-24", "w-32", "w-20", "w-12", "w-14"]} rows={rows} />
        </>
      );

    case "deployments-access-requests":
      return (
        <>
          {!tableOnly ? <AccessRequestsHeader /> : null}
          <AccessRequestsTable rows={rows} />
        </>
      );

    case "deployments-apps":
      return (
        <>
          {!tableOnly ? <AppsHeader /> : null}
          <AppsGrid rows={rows} />
        </>
      );

    case "deployments-audit":
      return (
        <>
          {!tableOnly ? (
            <div className="ds-panel is-dashboard">
              <SkeletonBar className="h-7 w-16 sm:h-8" />
              <SkeletonBar className="mt-2 h-4 w-full max-w-xl" />
            </div>
          ) : null}
          <AuditSection titleWidth="w-24" columns={["w-16", "w-20", "w-32"]} rows={rows} />
          <AuditSection titleWidth="w-28" columns={["w-16", "w-32", "w-24"]} rows={rows} />
        </>
      );

    case "auth-countries":
      return (
        <div className="flex flex-col gap-5">
          {!tableOnly ? (
            <>
              <AuthHeroHeader />
              <AuthToolbar buttonCount={3} />
            </>
          ) : null}
          <AuthWideTable rows={rows} />
        </div>
      );

    case "auth-protocols":
      return (
        <div className="flex flex-col gap-5">
          {!tableOnly ? (
            <>
              <AuthHeroHeader />
              <AuthToolbar buttonCount={5} />
            </>
          ) : null}
          <AuthProtocolsTable rows={rows} />
        </div>
      );

    case "auth-settings":
      return <AuthSettingsSkeleton />;
  }
}

export function AdminDirectorySkeleton({ tab, tableOnly = false, rows = 8 }: Props) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {renderTabSkeleton(tab, rows, tableOnly)}
    </div>
  );
}
