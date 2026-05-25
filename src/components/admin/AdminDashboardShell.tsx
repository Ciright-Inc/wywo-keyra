"use client";

import "@/styles/admin-dashboard.css";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminConfirmProvider } from "@/components/admin/AdminConfirmProvider";
import { AdminRouteToast } from "@/components/admin/AdminRouteToast";
import { AdminShellMainContent } from "@/components/admin/AdminShellMainContent";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { AdminSidebarIcon } from "@/components/admin/AdminSidebarIcon";
import { AdminTransitionLink } from "@/components/admin/AdminTransitionLink";
import { useAdminShellNavigation } from "@/lib/admin/useAdminShellNavigation";
import { lockDocumentScroll } from "@/lib/documentScrollLock";

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

const SITE_NAV: NavItem[] = [
  { href: "/admin/site/footer", label: "Footer", icon: "footer" },
];

const DEPLOYMENTS_NAV: NavItem[] = [
  { href: "/admin/deployments", label: "Overview", icon: "grid_view", exact: true },
  { href: "/admin/deployments/regions", label: "Regions", icon: "layers" },
  { href: "/admin/deployments/countries", label: "Countries", icon: "language" },
  { href: "/admin/deployments/telcos", label: "Telcos", icon: "cell_tower" },
  { href: "/admin/deployments/apps", label: "Apps", icon: "apps" },
  { href: "/admin/deployments/materials", label: "Materials", icon: "perm_media" },
  { href: "/admin/deployments/data-rooms", label: "Data rooms", icon: "folder" },
  { href: "/admin/deployments/server-nodes", label: "Server nodes", icon: "dns" },
  { href: "/admin/deployments/access-domain-rules", label: "Access domains", icon: "shield" },
  { href: "/admin/deployments/access-requests", label: "Access requests", icon: "inbox" },
  { href: "/admin/deployments/admin-users", label: "Admin users", icon: "group" },
  { href: "/admin/deployments/audit", label: "Audit", icon: "history" },
];

const AGENTS_NAV: NavItem[] = [
  { href: "/admin/agents", label: "Control center", icon: "hub", exact: true },
  { href: "/admin/agents/parent-agents", label: "Parent agents", icon: "account_tree" },
  { href: "/admin/agents/deployment-bridge", label: "Deployment bridge", icon: "swap_horiz" },
  { href: "/admin/agents/worlds", label: "Agent worlds", icon: "public" },
  { href: "/admin/agents/knowledge-packs", label: "Knowledge packs", icon: "library_books" },
  { href: "/admin/agents/inheritance", label: "Inheritance", icon: "device_hub" },
  { href: "/admin/agents/operational-graph", label: "Operational graph", icon: "share" },
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

function AdminMenuToggleIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6 6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { navigate, prefetch, isNavActive, pendingHref } = useAdminShellNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inAuthentication = pathname.startsWith("/admin/authentication");
  const inSite = pathname.startsWith("/admin/site");
  const inAgents = pathname.startsWith("/admin/agents");

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  const handleNavigate = useCallback(
    (href: string) => {
      navigate(href);
      setSidebarOpen(false);
    },
    [navigate],
  );

  useEffect(() => {
    for (const item of [...AUTH_NAV, ...SITE_NAV, ...DEPLOYMENTS_NAV, ...AGENTS_NAV]) {
      prefetch(item.href);
    }
  }, [prefetch]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;
    return lockDocumentScroll();
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const topbarTitle = inAuthentication
    ? "Authentication admin"
    : inSite
      ? "Site manage"
      : inAgents
        ? "Agent world admin"
        : "Deployments admin";

  return (
    <AdminConfirmProvider>
      <AdminRouteToast />
      <div
        data-surface="dashboard"
        className={`admin-dashboard${sidebarOpen ? " is-sidebar-open" : ""}`}
      >
        <button
          type="button"
          className="admin-dashboard__sidebar-backdrop"
          aria-label="Close navigation"
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={closeSidebar}
        />
        <aside id="admin-sidebar" className="ds-sidebar" aria-label="Admin navigation">
          <div className="ds-sidebar-brand">
            <p className="ds-sidebar-brand__eyebrow">Keyra admin</p>
            <p className="ds-sidebar-brand__title">Console</p>
            <p className="ds-sidebar-brand__desc">Deployments, agent worlds, authentication, and site controls.</p>
          </div>

          <nav className="ds-sidebar-nav">
            <SidebarNavGroup
              heading="Authentication"
              items={AUTH_NAV}
              isNavActive={isNavActive}
              navigate={handleNavigate}
              prefetch={prefetch}
            />
            <SidebarNavGroup
              heading="Deployments"
              items={DEPLOYMENTS_NAV}
              isNavActive={isNavActive}
              navigate={handleNavigate}
              prefetch={prefetch}
            />
            <SidebarNavGroup
              heading="Agent worlds"
              items={AGENTS_NAV}
              isNavActive={isNavActive}
              navigate={handleNavigate}
              prefetch={prefetch}
            />
            <SidebarNavGroup
              heading="Site manage"
              items={SITE_NAV}
              isNavActive={isNavActive}
              navigate={handleNavigate}
              prefetch={prefetch}
            />
          </nav>
        </aside>

        <div className="admin-dashboard__main">
          <header className="ds-topbar">
            <div className="ds-topbar__lead">
              <button
                type="button"
                className="ds-topbar__menu-toggle"
                aria-expanded={sidebarOpen}
                aria-controls="admin-sidebar"
                aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={toggleSidebar}
              >
                <AdminMenuToggleIcon open={sidebarOpen} />
              </button>
              <div className="ds-topbar__meta">
                <p className="ds-topbar__eyebrow">Keyra admin</p>
                <p className="ds-topbar__title">{topbarTitle}</p>
              </div>
            </div>
            <div className="ds-topbar__actions">
              <AdminSignOutButton />
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
