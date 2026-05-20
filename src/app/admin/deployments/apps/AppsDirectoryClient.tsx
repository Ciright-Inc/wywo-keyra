"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DeploymentAppView } from "@/lib/deploymentAppConstants";

const sectionDefinitions = [
  { title: "Core apps" },
  { title: "Media & engagement" },
  { title: "Operations" },
] as const;

function AppListIcon({ label }: { label: string }) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/20 bg-keyra-bg text-xs font-semibold text-keyra-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <Image
        src="/keyra-app-mark.png"
        alt=""
        fill
        sizes="40px"
        className="scale-[1.18] object-contain opacity-35"
        aria-hidden
        unoptimized
      />
      <span className="relative rounded-sm bg-white px-0.5 py-0.5 text-[10px] leading-none shadow-sm ring-1 ring-black/[0.06]">
        {label.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}

export function AppsDirectoryClient({ initialApps }: { initialApps: DeploymentAppView[] }) {
  const [apps, setApps] = useState(initialApps);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sections = useMemo(
    () =>
      sectionDefinitions.map((section) => ({
        title: section.title,
        apps: apps.filter((app) => app.section === section.title),
      })),
    [apps],
  );

  async function deleteApp(app: DeploymentAppView) {
    if (!window.confirm(`Delete ${app.label}?`)) return;
    setBusyId(app.id);
    try {
      const res = await fetch(`/api/admin/deployments/apps/${encodeURIComponent(app.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Delete failed.");
      }
      setApps((current) => current.filter((item) => item.id !== app.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 py-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-keyra-primary">Apps</h1>
            <span className="rounded-full border border-keyra-border bg-keyra-surface px-3 py-1 text-xs font-medium text-keyra-text-2">
              {apps.length}
            </span>
          </div>
          <Link
            href="/admin/deployments/apps/new"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium leading-none text-keyra-primary shadow-sm transition hover:bg-keyra-surface"
          >
            <span aria-hidden>+</span>
            Create new app
          </Link>
        </div>
        <p className="mt-2 text-sm text-keyra-text-2">
          Select an app to open its configured destination.
        </p>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-3">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-keyra-border bg-keyra-surface/45 p-2.5 shadow-[0_18px_54px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <h2 className="text-sm font-semibold text-keyra-primary">{section.title}</h2>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-[11px] text-keyra-text-2">
                {section.apps.length}
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {section.apps.map((app) => (
                <div
                  key={app.id}
                  className="group rounded-2xl border border-keyra-border bg-keyra-surface/70 px-3 py-2.5 transition hover:border-keyra-accent/40 hover:bg-keyra-surface"
                >
                  <div className="flex items-start justify-between gap-3">
                    <a
                      href={app.href}
                      className="flex min-w-0 flex-1 items-center gap-2.5"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AppListIcon label={app.label} />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-keyra-primary">{app.label}</h3>
                          {app.isPrivate ? (
                            <span className="shrink-0 rounded-full border border-keyra-border bg-keyra-bg px-1.5 py-0.5 text-[10px] font-medium text-keyra-text-2">
                              Private
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-sm text-keyra-text-2">{app.description}</p>
                      </div>
                    </a>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <a
                        href={app.href}
                        className="rounded-full p-1.5 text-keyra-accent transition group-hover:bg-[var(--keyra-action)] group-hover:text-keyra-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${app.label}`}
                      >
                        <svg
                          className="block size-3 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/deployments/apps/${app.id}/edit`}
                          className="rounded-full border border-keyra-border bg-keyra-bg px-2.5 py-1 text-[11px] font-medium text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
                          aria-label={`Edit ${app.label}`}
                          title={`Edit ${app.label}`}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteApp(app)}
                          disabled={busyId === app.id}
                          className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60"
                          aria-label={`Delete ${app.label}`}
                          title={`Delete ${app.label}`}
                        >
                          {busyId === app.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
