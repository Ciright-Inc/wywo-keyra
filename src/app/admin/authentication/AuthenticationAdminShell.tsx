"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin/authentication/countries", label: "Authentication countries" },
  { href: "/admin/authentication/protocols", label: "SAT protocols" },
  { href: "/admin/authentication/settings", label: "Feed settings" },
];

export function AuthenticationAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">
            Latest authentications
          </p>
          <nav className="mt-3 flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-2 py-1.5 text-sm transition ${
                    active
                      ? "bg-[var(--keyra-action)] font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)]"
                      : "text-keyra-text-2 hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/admin/deployments"
            className="mt-6 inline-block text-sm text-keyra-text-2 underline-offset-4 hover:text-keyra-primary hover:underline"
          >
            ← Deployments admin
          </Link>
        </aside>
        <div className="min-w-0 flex-1 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
