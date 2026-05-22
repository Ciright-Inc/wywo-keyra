"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ALL_APP_CATEGORIES_FILTER,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import { deleteDeploymentAppMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { GensparkSlidePanel } from "./GensparkSlidePanel";

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

function CategoryChip({ label }: { label: string }) {
  return (
    <span className="ds-badge-pill inline-flex max-w-full shrink-0 truncate normal-case tracking-normal">
      {label}
    </span>
  );
}

function GensparkIconButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title="Open slides"
      aria-label={`Open slides for ${label}`}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md border border-keyra-border bg-keyra-bg text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 3 9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5Z" />
        <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
      </svg>
    </button>
  );
}

type Props = {
  initialApps: DeploymentAppView[];
  categories: string[];
};

export function AppsDirectoryClient({ initialApps, categories }: Props) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const [apps, setApps] = useState(initialApps);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_APP_CATEGORIES_FILTER);
  const [gensparkPanel, setGensparkPanel] = useState<{ url: string; label: string } | null>(null);

  const visibleApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (categoryFilter !== ALL_APP_CATEGORIES_FILTER && app.section !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return [app.label, app.description, app.href, app.section, app.gensparkUrl].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      );
    });
  }, [apps, query, categoryFilter]);

  const hasSearch = query.trim().length > 0;
  const hasCategoryFilter = categoryFilter !== ALL_APP_CATEGORIES_FILTER;
  const totalVisible = visibleApps.length;

  async function deleteApp(app: DeploymentAppView) {
    if (!(await confirm(deleteDeploymentAppMessage(app.label)))) return;
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
      showAdminActionToast(toast, "deleted", "app", { name: app.label });
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Delete failed.");
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
              {hasSearch || hasCategoryFilter ? `${totalVisible} of ${apps.length}` : apps.length}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CollapsibleSearchBar
              mode="client"
              searchQuery={query}
              onChange={setQuery}
              placeholder="Label, description, link, category…"
              ariaLabel="Search apps"
            />
            <Link
              href="/admin/deployments/apps/new"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium leading-none text-keyra-primary shadow-sm transition hover:bg-keyra-surface"
            >
              <span aria-hidden>+</span>
              Create new app
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-keyra-text-2">
          Select an app to open its configured destination. Newly created apps appear first.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-keyra-text-2">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 w-full min-w-0 rounded-2xl border border-keyra-border bg-keyra-bg px-3 text-sm text-keyra-primary outline-none focus-visible:keyra-focus sm:w-auto sm:min-w-[12rem]"
            aria-label="Filter apps by category"
          >
            <option value={ALL_APP_CATEGORIES_FILTER}>All apps</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalVisible === 0 ? (
        <AdminListEmptyState
          variant="panel"
          hasSearch={hasSearch}
          hasFilter={hasCategoryFilter}
          entityName="apps"
        />
      ) : (
        <div className="mt-6 rounded-3xl border border-keyra-border bg-keyra-surface/45 p-2.5 shadow-[0_18px_54px_rgba(0,0,0,0.04)] sm:p-3">
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {visibleApps.map((app) => {
            const isDeleting = busyId === app.id;
            return (
            <li
              key={app.id}
              className={`group rounded-2xl border border-keyra-border bg-keyra-surface/70 px-3 py-3 transition hover:border-keyra-accent/40 hover:bg-keyra-surface sm:px-4 ${isDeleting ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={app.href}
                  className="flex min-w-0 flex-1 items-start gap-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AppListIcon label={app.label} />
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-keyra-primary">{app.label}</h2>
                      <CategoryChip label={app.section} />
                      {app.isPrivate ? (
                        <span className="shrink-0 rounded-full border border-keyra-border bg-keyra-bg px-1.5 py-0.5 text-[10px] font-medium text-keyra-text-2">
                          Private
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-keyra-text-2">{app.description}</p>
                  </div>
                </a>
                <div className="flex shrink-0 flex-col items-end gap-2">
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
                  <div className="inline-flex items-center gap-1.5">
                    {app.gensparkUrl ? (
                      <GensparkIconButton
                        label={app.label}
                        onClick={() =>
                          setGensparkPanel({ url: app.gensparkUrl!, label: app.label })
                        }
                      />
                    ) : null}
                    <RowActions
                      editHref={`/admin/deployments/apps/${app.id}/edit`}
                      editAriaLabel={`Edit ${app.label}`}
                      canDelete
                      deleteAriaLabel={`Delete ${app.label}`}
                      onDelete={() => void deleteApp(app)}
                      isDeleting={isDeleting}
                    />
                  </div>
                </div>
              </div>
            </li>
            );
          })}
          </ul>
        </div>
      )}

      <GensparkSlidePanel
        open={gensparkPanel !== null}
        url={gensparkPanel?.url ?? null}
        label={gensparkPanel?.label ?? ""}
        onClose={() => setGensparkPanel(null)}
      />
    </div>
  );
}
