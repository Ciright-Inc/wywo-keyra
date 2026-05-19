"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin/authentication/countries", label: "Authentication countries", icon: "globe" },
  { href: "/admin/authentication/protocols", label: "SAT protocols", icon: "protocol" },
  { href: "/admin/authentication/settings", label: "Feed settings", icon: "settings" },
] as const;

function AuthNavIcon({ name }: { name: (typeof nav)[number]["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      {name === "globe" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M4 12h16M12 4c2 2.2 3 4.9 3 8s-1 5.8-3 8c-2-2.2-3-4.9-3-8s1-5.8 3-8" />
        </>
      ) : name === "protocol" ? (
        <>
          <path {...common} d="M12 3 4.5 7.5V16.5L12 21l7.5-4.5V7.5z" />
          <path {...common} d="M8.5 10.5 12 8.5l3.5 2v4L12 16.5l-3.5-2z" />
        </>
      ) : (
        <>
          <path {...common} d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z" />
          <path {...common} d="M19 12a7 7 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.2 3h-4.4l-.4 2.8a7 7 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.9 1.1l.4 2.8h4.4l.4-2.8a7 7 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1.1z" />
        </>
      )}
    </svg>
  );
}

export function AuthenticationAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
        <aside className="shrink-0 lg:sticky lg:top-16 lg:z-[90] lg:w-72 lg:self-start">
          <div className="rounded-3xl border border-keyra-border bg-keyra-surface/85 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.06)]">
            <div className="border-b border-keyra-border px-3 pb-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-keyra-text-2">Admin</p>
              <h2 className="mt-2 text-lg font-semibold text-keyra-primary">Latest authentications</h2>
              <p className="mt-1 text-xs leading-5 text-keyra-text-2">
                Feed controls, country weights, and SAT protocol catalog.
              </p>
            </div>

            <nav className="mt-3 flex flex-col gap-1" aria-label="Authentication admin">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-keyra-bg font-semibold text-keyra-primary shadow-sm ring-1 ring-black/10"
                        : "text-keyra-text-2 hover:bg-keyra-bg/70 hover:text-keyra-primary"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl border transition ${
                        active
                          ? "border-black/15 bg-white text-keyra-primary"
                          : "border-keyra-border bg-keyra-bg/80 text-keyra-text-2 group-hover:border-black/15 group-hover:text-keyra-primary"
                      }`}
                    >
                      <AuthNavIcon name={item.icon} />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/admin/deployments"
              className="mt-4 flex items-center gap-2 rounded-2xl border border-keyra-border bg-keyra-bg/70 px-3 py-2.5 text-sm font-medium text-keyra-text-2 transition hover:border-black/15 hover:text-keyra-primary"
            >
              <span aria-hidden>&lt;-</span>
              <span>Deployments admin</span>
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1 overflow-x-auto lg:min-h-0">{children}</div>
      </div>
    </div>
  );
}
