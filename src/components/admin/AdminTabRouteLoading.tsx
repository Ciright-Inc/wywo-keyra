import type { AdminSkeletonTab } from "./AdminDirectorySkeleton";
import { AdminDirectorySkeleton } from "./AdminDirectorySkeleton";
import {
  adminBody,
  adminCheckbox,
  adminCountBadge,
  adminEyebrow,
  adminLabel,
  adminLegacyInput,
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

function DeploymentsPanelStaticHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className={adminPanel}>
      <div>
        <h1 className={adminPageTitle}>{title}</h1>
        <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>{description}</p>
      </div>
    </div>
  );
}

function DeploymentsOverviewStaticHeader() {
  return (
    <section className="ds-feature-card is-dashboard">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="ds-caption-uppercase">Deployment registry</p>
          <h1 className="ds-display-sm mt-2">Deployments overview</h1>
          <p className="ds-body-sm mt-3 text-[var(--ds-body)]">
            Internal control surface for regions, countries, telcos, access policy, and public deployment visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="ds-btn-primary is-sm pointer-events-none">Review access</span>
        </div>
      </div>
    </section>
  );
}

function AppsListStaticHeader() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 py-1">
        <h1 className={adminPageTitle}>Apps</h1>
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
      <h1 className={adminPageTitle}>Access requests</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Approve or reject after email verification.</p>
    </div>
  );
}

function AuditStaticHeader() {
  return (
    <div className={adminPanel}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={adminPageTitle}>Audit</h1>
          <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
            Immutable-style audit trail and status transitions. Each section searches and pages independently.
          </p>
        </div>
        <span className="ds-btn-secondary is-sm pointer-events-none shrink-0 opacity-60" aria-hidden>
          Search
        </span>
      </div>
    </div>
  );
}

function AuthCountriesStaticHeader() {
  return (
    <section className="relative overflow-hidden ds-feature-card is-dashboard sm:px-7">
      <div className="max-w-3xl">
        <h1 className={adminPageTitle}>Authentication countries</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Manage country eligibility, weighting, and feed visibility for authentication events.
        </p>
      </div>
    </section>
  );
}

function AuthProtocolsStaticHeader() {
  return (
    <section className="relative overflow-hidden ds-feature-card is-dashboard sm:px-7">
      <div className="max-w-3xl">
        <h1 className={adminPageTitle}>SAT protocols</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Global SAT-Core registry. Home and roaming percentages must total 100% (default 40 / 60).
        </p>
      </div>
    </section>
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
  }
}

/** Route-level loading: real page title + list-area skeleton only. */
export function AdminTabRouteLoading({ tab }: { tab: AdminSkeletonTab }) {
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