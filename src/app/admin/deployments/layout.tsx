"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin/deployments", label: "Overview" },
  { href: "/admin/deployments/regions", label: "Regions" },
  { href: "/admin/deployments/countries", label: "Countries" },
  { href: "/admin/deployments/telcos", label: "Telcos" },
  { href: "/admin/deployments/server-nodes", label: "Server nodes" },
  { href: "/admin/deployments/access-domain-rules", label: "Access domains" },
  { href: "/admin/deployments/access-requests", label: "Access requests" },
  { href: "/admin/deployments/audit", label: "Audit" },
];

export default function AdminDeploymentsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Deployments</p>
          <nav className="mt-3 flex flex-col gap-1">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin/deployments" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-2 py-1.5 text-sm transition ${
                    active
                      ? "bg-[rgba(102,227,255,0.12)] font-medium text-keyra-primary ring-1 ring-[rgba(102,227,255,0.35)]"
                      : "text-keyra-text-2 hover:bg-[rgba(255,255,255,0.04)] hover:text-keyra-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form
            className="mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/admin/auth/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
          >
            <button
              type="submit"
              className="text-sm text-keyra-text-2 underline-offset-4 hover:text-keyra-primary hover:underline"
            >
              Sign out
            </button>
          </form>
        </aside>
        <div className="min-w-0 flex-1 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
