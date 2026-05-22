"use client";

import "@/styles/admin-dashboard.css";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminConfirmProvider } from "@/components/admin/AdminConfirmProvider";
import { AdminRouteToast } from "@/components/admin/AdminRouteToast";
import { AdminShellMainContent } from "@/components/admin/AdminShellMainContent";
import { AdminSidebarIcon } from "@/components/admin/AdminSidebarIcon";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { useAdminShellNavigation } from "@/lib/admin/useAdminShellNavigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
};

const AUTH_NAV: NavItem[] = [
  { href: "/admin/authentication/countries", label: "Auth countries", icon: "public" },
  { href: "/admin/authentication/protocols", label: "SAT protocols", icon: "category" },
];

const DEPLOYMENTS_NAV: NavItem[] = [
  { href: "/admin/deployments", label: "Overview", icon: "grid_view", exact: true },
  { href: "/admin/deployments/regions", label: "Regions", icon: "layers" },
  { href: "/admin/deployments/countries", label: "Countries", icon: "language" },
  { href: "/admin/deployments/telcos", label: "Telcos", icon: "cell_tower" },
  { href: "/admin/deployments/apps", label: "Apps", icon: "apps" },
  { href: "/admin/deployments/server-nodes", label: "Server nodes", icon: "dns" },
  { href: "/admin/deployments/access-domain-rules", label: "Access domains", icon: "shield" },
  { href: "/admin/deployments/access-requests", label: "Access requests", icon: "inbox" },
  { href: "/admin/deployments/admin-users", label: "Admin users", icon: "group" },
  { href: "/admin/deployments/audit", label: "Audit", icon: "history" },
];

function SidebarNavGroup({
  heading,
  items,
  isNavActive,
  navigate,
  prefetch,
}: {
  heading: string;
  items: NavItem[];
  isNavActive: (href: string, opts?: { exact?: boolean }) => boolean;
  navigate: (href: string) => void;
  prefetch: (href: string) => void;
}) {
  return (
    <>
      <p className="ds-sidebar-heading">{heading}</p>
      {items.map((item) => {
        const active = item.exact ? isNavActive(item.href, { exact: true }) : isNavActive(item.href);
        return (
          <AdminTransitionLink
            key={item.href}
            href={item.href}
            prefetch
            onNavigate={navigate}
            aria-current={active ? "page" : undefined}
            className={`ds-sidebar-row${active ? " is-active" : ""}`}
          >
            <AdminSidebarIcon name={item.icon} />
            <span className="ds-sidebar-row__label">{item.label}</span>
          </AdminTransitionLink>
        );
      })}
    </>
  );
}

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { navigate, prefetch, isNavActive, pendingHref } = useAdminShellNavigation();
  const inAuthentication = pathname.startsWith("/admin/authentication");

  useEffect(() => {
    for (const item of [...AUTH_NAV, ...DEPLOYMENTS_NAV]) {
      prefetch(item.href);
    }
  }, [prefetch]);

  const topbarTitle = inAuthentication ? "Authentication admin" : "Deployments admin";

  return (
    <AdminConfirmProvider>
      <AdminRouteToast />
      <div data-surface="dashboard" className="admin-dashboard">
        <aside className="ds-sidebar" aria-label="Admin navigation">
          <div className="ds-sidebar-brand">
            <p className="ds-sidebar-brand__eyebrow">Keyra admin</p>
            <p className="ds-sidebar-brand__title">
              {inAuthentication ? "Authentication" : "Deployments"}
            </p>
            <p className="ds-sidebar-brand__desc">
              {inAuthentication
                ? "Feed controls, country weights, and SAT protocol catalog."
                : "Registry controls and access workflows."}
            </p>
          </div>

          <nav className="ds-sidebar-nav">
            <SidebarNavGroup
              heading="Authentication"
              items={AUTH_NAV}
              isNavActive={isNavActive}
              navigate={navigate}
              prefetch={prefetch}
            />
            <SidebarNavGroup
              heading="Deployments"
              items={DEPLOYMENTS_NAV}
              isNavActive={isNavActive}
              navigate={navigate}
              prefetch={prefetch}
            />
          </nav>
        </aside>

        <div className="admin-dashboard__main">
          <header className="ds-topbar">
            <p className="ds-topbar__title">{topbarTitle}</p>
            <div className="ds-topbar__actions">
              <AdminTransitionLink
                href="/global-deployment"
                prefetch
                onNavigate={navigate}
                className="ds-btn-secondary is-sm"
              >
                Public explorer
              </AdminTransitionLink>
            </div>
          </header>

          <AdminShellMainContent
            pendingHref={pendingHref}
            className="admin-dashboard__content"
            id="admin-main-content"
          >
            {children}
          </AdminShellMainContent>
        </div>
      </div>
    </AdminConfirmProvider>
  );
}
