"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin/authentication", label: "Auth feed", icon: "pulse" },
  { href: "/admin/deployments", label: "Overview", icon: "grid" },
  { href: "/admin/deployments/regions", label: "Regions", icon: "layers" },
  { href: "/admin/deployments/countries", label: "Countries", icon: "globe" },
  { href: "/admin/deployments/telcos", label: "Telcos", icon: "tower" },
  { href: "/admin/deployments/apps", label: "Apps", icon: "apps" },
  { href: "/admin/deployments/server-nodes", label: "Server nodes", icon: "server" },
  { href: "/admin/deployments/access-domain-rules", label: "Access domains", icon: "shield" },
  { href: "/admin/deployments/access-requests", label: "Access requests", icon: "inbox" },
  { href: "/admin/deployments/audit", label: "Audit", icon: "audit" },
] as const;

function NavIcon({ name }: { name: (typeof nav)[number]["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      {name === "pulse" ? (
        <path {...common} d="M4 12h3l2-5 4 10 2-5h5" />
      ) : name === "grid" ? (
        <>
          <path {...common} d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5z" />
          <path {...common} d="M14 5.5A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 14 8.5z" />
          <path {...common} d="M4 15.5A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5z" />
          <path {...common} d="M14 15.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5z" />
        </>
      ) : name === "layers" ? (
        <>
          <path {...common} d="m12 4 8 4-8 4-8-4z" />
          <path {...common} d="m4 12 8 4 8-4" />
          <path {...common} d="m4 16 8 4 8-4" />
        </>
      ) : name === "globe" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8" />
        </>
      ) : name === "tower" ? (
        <>
          <path {...common} d="M12 20V8" />
          <path {...common} d="m8 20 4-12 4 12" />
          <path {...common} d="M8 8a5 5 0 0 1 8 0M5 5a9 9 0 0 1 14 0" />
        </>
      ) : name === "apps" ? (
        <path {...common} d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" />
      ) : name === "server" ? (
        <>
          <path {...common} d="M5 5h14v5H5zM5 14h14v5H5z" />
          <path {...common} d="M8 7.5h.01M8 16.5h.01" />
        </>
      ) : name === "shield" ? (
        <path {...common} d="M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10z" />
      ) : name === "inbox" ? (
        <>
          <path {...common} d="M4 13h5l2 3h2l2-3h5" />
          <path {...common} d="M5 13 7 5h10l2 8v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
        </>
      ) : (
        <>
          <path {...common} d="M7 4h10v16H7z" />
          <path {...common} d="M9.5 8h5M9.5 12h5M9.5 16h3" />
        </>
      )}
    </svg>
  );
}

export function AdminDeploymentsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
        <aside className="shrink-0 lg:sticky lg:top-16 lg:z-[90] lg:w-72 lg:self-start">
          <div className="rounded-3xl border border-keyra-border bg-keyra-surface/85 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.06)]">
            <div className="border-b border-keyra-border px-3 pb-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyra-text-2">Admin</p>
              <h2 className="mt-2 text-lg font-semibold text-keyra-primary">Deployments</h2>
              <p className="mt-1 text-xs leading-5 text-keyra-text-2">
                Registry controls and access workflows.
              </p>
            </div>

            <nav className="mt-3 flex flex-col gap-1" aria-label="Deployment admin">
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin/deployments" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-keyra-bg font-semibold text-keyra-primary shadow-sm ring-1 ring-black/10"
                        : "text-keyra-text-2 hover:bg-keyra-bg/70 hover:text-keyra-primary"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl border transition ${
                          active
                            ? "border-black/15 bg-white text-keyra-primary"
                            : "border-keyra-border bg-keyra-bg/80 text-keyra-text-2 group-hover:border-black/15 group-hover:text-keyra-primary"
                        }`}
                      >
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1 overflow-x-auto lg:min-h-0">{children}</div>
      </div>
    </div>
  );
}
