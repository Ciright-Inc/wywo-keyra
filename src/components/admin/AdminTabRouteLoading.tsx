import type { AdminSkeletonTab } from "./AdminDirectorySkeleton";
import { AdminDirectorySkeleton } from "./AdminDirectorySkeleton";

function DeploymentsPanelStaticHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="ds-panel is-dashboard">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">{title}</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">{description}</p>
      </div>
    </div>
  );
}

function DeploymentsOverviewStaticHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-8">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">Deployment registry</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl">Deployments overview</h1>
          <p className="mt-3 text-sm leading-6 text-keyra-text-2">
            Internal control surface for regions, countries, telcos, access policy, and public deployment visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-keyra-border bg-keyra-bg px-4 py-2 text-sm font-medium text-keyra-primary">
            Public explorer
          </span>
          <span className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)]">
            Review access
          </span>
        </div>
      </div>
    </section>
  );
}

function AppsListStaticHeader() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 py-1">
        <h1 className="text-2xl font-semibold text-keyra-primary">Apps</h1>
      </div>
      <p className="mt-2 text-sm text-keyra-text-2">
        Select an app to open its configured destination. Newly created apps appear first.
      </p>
    </div>
  );
}

function AccessRequestsStaticHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Access requests</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Approve or reject after email verification.</p>
    </div>
  );
}

function AuditStaticHeader() {
  return (
    <div className="ds-panel is-dashboard">
      <h1 className="text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">Audit</h1>
      <p className="mt-1.5 max-w-xl text-sm leading-snug text-keyra-text-2">
        Deployment audit events and status history across the registry.
      </p>
    </div>
  );
}

function AuthCountriesStaticHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-7">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-keyra-primary">Authentication countries</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Manage country eligibility, weighting, and feed visibility for authentication events.
        </p>
      </div>
    </section>
  );
}

function AuthProtocolsStaticHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-7">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-keyra-primary">SAT protocols</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Global SAT-Core registry. Home and roaming percentages must total 100% (default 40 / 60).
        </p>
      </div>
    </section>
  );
}

function AuthSettingsStaticHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-keyra-primary">Authentication feed settings</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Configure feed defaults and visibility.</p>
    </div>
  );
}

function renderStaticHeader(tab: AdminSkeletonTab) {
  switch (tab) {
    case "deployments-overview":
      return <DeploymentsOverviewStaticHeader />;
    case "deployments-regions":
      return (
        <DeploymentsPanelStaticHeader
          title="Regions"
          description="Published market groups for the deployment map."
        />
      );
    case "deployments-countries":
      return (
        <DeploymentsPanelStaticHeader
          title="Countries"
          description="Country deployment records linked to regions."
        />
      );
    case "deployments-telcos":
      return (
        <DeploymentsPanelStaticHeader
          title="Telcos"
          description="Full telco catalog — click any column header to sort."
        />
      );
    case "deployments-apps":
      return <AppsListStaticHeader />;
    case "deployments-server-nodes":
      return (
        <DeploymentsPanelStaticHeader
          title="Server nodes"
          description="Infrastructure endpoints attached to deployment targets."
        />
      );
    case "deployments-access-domain-rules":
      return (
        <DeploymentsPanelStaticHeader
          title="Access domain rules"
          description="Email domain verification rules for country and telco targets."
        />
      );
    case "deployments-access-requests":
      return <AccessRequestsStaticHeader />;
    case "deployments-admin-users":
      return (
        <DeploymentsPanelStaticHeader
          title="Admin users"
          description="Manage who can access the deployment console."
        />
      );
    case "deployments-audit":
      return <AuditStaticHeader />;
    case "auth-countries":
      return <AuthCountriesStaticHeader />;
    case "auth-protocols":
      return <AuthProtocolsStaticHeader />;
    case "auth-settings":
      return <AuthSettingsStaticHeader />;
  }
}

function AuthSettingsFormSkeleton() {
  return (
    <div className="mt-6 max-w-xl space-y-4">
      <div className="space-y-3">
        <div className="keyra-skeleton h-5 w-28" aria-hidden />
        <div className="keyra-skeleton h-5 w-32" aria-hidden />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="keyra-skeleton h-4 w-32" aria-hidden />
            <div className="keyra-skeleton mt-1 h-10 w-full rounded-md" aria-hidden />
          </div>
        ))}
      </div>
      <div className="keyra-skeleton h-10 w-32 rounded-full" aria-hidden />
    </div>
  );
}

/** Route-level loading: real page title + list-area skeleton only. */
export function AdminTabRouteLoading({ tab }: { tab: AdminSkeletonTab }) {
  if (tab === "auth-settings") {
    return (
      <div aria-busy="true" aria-label="Loading">
        {renderStaticHeader(tab)}
        <AuthSettingsFormSkeleton />
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={tab.startsWith("auth-") ? "flex flex-col gap-5" : undefined}
    >
      {renderStaticHeader(tab)}
      <div
        className={
          tab === "deployments-overview" || tab === "deployments-access-requests"
            ? "mt-8"
            : tab.startsWith("auth-")
              ? undefined
              : "mt-3"
        }
      >
        <AdminDirectorySkeleton tab={tab} tableOnly />
      </div>
    </div>
  );
}
