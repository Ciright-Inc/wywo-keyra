"use client";

// admin-dashboard.css is loaded by the server layout (app/wywo/(shell)/layout.tsx)
// so first paint already has the sidebar/topbar styles — no FOUC on cold loads.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { lockDocumentScroll } from "@/lib/documentScrollLock";
import { WywoSidebarIcon } from "./WywoSidebarIcon";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
};

const MESSAGES_NAV: NavItem[] = [
  { href: "/wywo", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/wywo/inbox", label: "Inbox", icon: "inbox" },
  { href: "/wywo/pending", label: "Pending trust", icon: "pending" },
  { href: "/wywo/sent", label: "Sent", icon: "sent" },
  { href: "/wywo/compose", label: "Compose", icon: "compose" },
];

const TRUST_NAV: NavItem[] = [
  { href: "/wywo/trust-rings", label: "Trust rings", icon: "rings" },
  { href: "/wywo/contacts", label: "Contacts", icon: "contacts" },
];

const WORLD_NAV: NavItem[] = [
  { href: "/wywo/onboarding", label: "Your world", icon: "world" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/wywo/admin", label: "All messages", icon: "admin", exact: true },
  { href: "/wywo/admin/invites", label: "Invites", icon: "invites" },
  { href: "/wywo/admin/audit", label: "Audit log", icon: "audit" },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavGroup({
  heading,
  items,
  pathname,
  onNavigate,
}: {
  heading: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <p className="ds-sidebar-heading">{heading}</p>
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-current={active ? "page" : undefined}
            className={`ds-sidebar-row${active ? " is-active" : ""}`}
            onClick={onNavigate}
          >
            <WywoSidebarIcon name={item.icon} />
            <span className="ds-sidebar-row__label">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

type Props = {
  children: ReactNode;
  adminEnabled: boolean;
  displayName: string;
  phoneE164: string;
};

const TOPBAR_TITLES: Array<{ test: (p: string) => boolean; title: string }> = [
  { test: (p) => p.startsWith("/wywo/inbox"), title: "Inbox" },
  { test: (p) => p.startsWith("/wywo/pending"), title: "Pending trust" },
  { test: (p) => p.startsWith("/wywo/sent"), title: "Sent" },
  { test: (p) => p.startsWith("/wywo/compose"), title: "Compose" },
  { test: (p) => p.startsWith("/wywo/trust-rings"), title: "Trust rings" },
  { test: (p) => p.startsWith("/wywo/contacts"), title: "Contacts" },
  { test: (p) => p.startsWith("/wywo/onboarding"), title: "Your WYWO world" },
  { test: (p) => p.startsWith("/wywo/admin/audit"), title: "Audit log" },
  { test: (p) => p.startsWith("/wywo/admin/invites"), title: "SMS invites" },
  { test: (p) => p.startsWith("/wywo/admin"), title: "WYWO administration" },
  { test: (p) => p.startsWith("/wywo/messages"), title: "Message detail" },
];

function resolveTopbarTitle(pathname: string): string {
  for (const m of TOPBAR_TITLES) if (m.test(pathname)) return m.title;
  return "Dashboard";
}

export function WywoShell({ children, adminEnabled, displayName, phoneE164 }: Props) {
  const pathname = usePathname() ?? "";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

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

  const topbarTitle = resolveTopbarTitle(pathname);

  return (
    <div
      data-surface="dashboard"
      className={`admin-dashboard wywo-surface${sidebarOpen ? " is-sidebar-open" : ""}`}
    >
      <button
        type="button"
        className="admin-dashboard__sidebar-backdrop"
        aria-label="Close navigation"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={closeSidebar}
      />

      <aside id="wywo-sidebar" className="ds-sidebar" aria-label="WYWO navigation">
        <div className="ds-sidebar-brand">
          <p className="ds-sidebar-brand__eyebrow">Keyra · WYWO</p>
          <p className="ds-sidebar-brand__title">While You Were Out</p>
          <p className="ds-sidebar-brand__desc">
            Trusted messaging for verified people and verified agents.
          </p>
        </div>

        <nav className="ds-sidebar-nav">
          <NavGroup
            heading="Messages"
            items={MESSAGES_NAV}
            pathname={pathname}
            onNavigate={closeSidebar}
          />
          <NavGroup
            heading="Trust graph"
            items={TRUST_NAV}
            pathname={pathname}
            onNavigate={closeSidebar}
          />
          <NavGroup
            heading="World"
            items={WORLD_NAV}
            pathname={pathname}
            onNavigate={closeSidebar}
          />
          {adminEnabled ? (
            <NavGroup
              heading="Administration"
              items={ADMIN_NAV}
              pathname={pathname}
              onNavigate={closeSidebar}
            />
          ) : null}
        </nav>
      </aside>

      <div className="admin-dashboard__main">
        <header className="ds-topbar">
          <div className="ds-topbar__lead">
            <button
              type="button"
              className="ds-topbar__menu-toggle"
              aria-expanded={sidebarOpen}
              aria-controls="wywo-sidebar"
              aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={toggleSidebar}
            >
              <MenuToggleIcon open={sidebarOpen} />
            </button>
            <div className="ds-topbar__meta">
              <p className="ds-topbar__eyebrow">While You Were Out</p>
              <p className="ds-topbar__title">{topbarTitle}</p>
            </div>
          </div>
          <div className="ds-topbar__actions">
            <span className="wywo-topbar-identity" title={phoneE164}>
              <span className="wywo-topbar-identity__name">{displayName}</span>
              <span className="wywo-topbar-identity__phone">{phoneE164}</span>
            </span>
          </div>
        </header>

        <div className="admin-dashboard__content">{children}</div>
      </div>
    </div>
  );
}
