"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ALL_APP_CATEGORIES_FILTER,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";
import { deleteDeploymentAppMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { GensparkSlidePanel } from "./GensparkSlidePanel";
import {
  adminBody,
  adminCheckbox,
  adminCountBadge,
  adminEyebrow,
  adminFilterLabel,
  adminFilterToolbar,
  adminLabel,
  adminLegacyInput,
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminToolbarStrip,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

type AppsViewMode = "grid" | "list";

const APPS_VIEW_STORAGE_KEY = "keyra-admin-apps-view";

function AdminAppsGlyph({
  name,
  className = "block size-[18px]",
}: {
  name: "grid_view" | "view_list" | "add";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "grid_view") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (name === "view_list") {
    return (
      <svg {...common}>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function AppsViewToggle({
  value,
  onChange,
}: {
  value: AppsViewMode;
  onChange: (mode: AppsViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Apps view">
      <button
        type="button"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[var(--ds-radius-md)] transition",
          value === "grid"
            ? "bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]"
            : "text-[var(--ds-body)] hover:bg-[var(--ds-canvas-soft)] hover:text-[var(--ds-ink)]",
        )}
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
      >
        <AdminAppsGlyph name="grid_view" />
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-[var(--ds-radius-md)] transition",
          value === "list"
            ? "bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]"
            : "text-[var(--ds-body)] hover:bg-[var(--ds-canvas-soft)] hover:text-[var(--ds-ink)]",
        )}
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <AdminAppsGlyph name="view_list" />
      </button>
    </div>
  );
}

function OpenAppLinkButton({ app }: { app: DeploymentAppView }) {
  return (
    <a
      href={app.href}
      className="ds-btn-icon"
      style={{ width: 32, height: 32 }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${app.label}`}
    >
      <svg
        className="block size-3"
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
  );
}

function AppRowActions({
  app,
  isDeleting,
  onDelete,
  onOpenSlide,
}: {
  app: DeploymentAppView;
  isDeleting: boolean;
  onDelete: () => void;
  onOpenSlide: (payload: { url: string; label: string }) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <OpenAppLinkButton app={app} />
      {app.temporaryUrl ? (
        <TemporaryUrlIconButton label={app.label} url={app.temporaryUrl} />
      ) : null}
      {app.gensparkUrl ? (
        <GensparkIconButton label={app.label} url={app.gensparkUrl} onOpen={onOpenSlide} />
      ) : null}
      <RowActions
        editHref={`/admin/deployments/apps/${app.id}/edit`}
        editAriaLabel={`Edit ${app.label}`}
        canDelete
        deleteAriaLabel={`Delete ${app.label}`}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function AppListIcon({ label }: { label: string }) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] text-xs font-semibold text-[var(--ds-ink)]">
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
  url,
  onOpen,
}: {
  label: string;
  url: string;
  onOpen: (payload: { url: string; label: string }) => void;
}) {
  return (
    <button
      type="button"
      title="Open slides"
      aria-label={`Open slides for ${label}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen({ url, label });
      }}
      className="ds-btn-icon" style={{ width: 32, height: 32 }}
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

function TemporaryUrlIconButton({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      className="ds-btn-icon"
      style={{ width: 32, height: 32 }}
      target="_blank"
      rel="noopener noreferrer"
      title="Open temporary URL"
      aria-label={`Open temporary URL for ${label}`}
      onClick={(event) => event.stopPropagation()}
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
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    </a>
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
  const [viewMode, setViewMode] = useState<AppsViewMode>("grid");

  useEffect(() => {
    const stored = window.localStorage.getItem(APPS_VIEW_STORAGE_KEY);
    if (stored === "grid" || stored === "list") setViewMode(stored);
  }, []);

  function handleViewModeChange(mode: AppsViewMode) {
    setViewMode(mode);
    window.localStorage.setItem(APPS_VIEW_STORAGE_KEY, mode);
  }

  const visibleApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (categoryFilter !== ALL_APP_CATEGORIES_FILTER && app.section !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return [app.label, app.description, app.href, app.section, app.gensparkUrl, app.temporaryUrl].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      );
    });
  }, [apps, query, categoryFilter]);

  const hasSearch = query.trim().length > 0;
  const hasCategoryFilter = categoryFilter !== ALL_APP_CATEGORIES_FILTER;
  const totalVisible = visibleApps.length;

  function openUrlSlidePanel(payload: { url: string; label: string }) {
    setGensparkPanel(payload);
  }

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
            <h1 className={adminPageTitle}>Apps</h1>
            <span className={adminCountBadge}>
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
            <Link href="/admin/deployments/apps/new" className="ds-btn-primary is-sm">
              <AdminAppsGlyph name="add" />
              Create new app
            </Link>
          </div>
        </div>
        <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>
          Select an app to open its configured destination. Newly created apps appear first.
        </p>
      </div>

      <div className={adminToolbarStrip}>
        <div className={adminFilterToolbar}>
          <label className={adminFilterLabel}>
            Category
            <AdminSelectMenu
              value={categoryFilter}
              onChange={setCategoryFilter}
              wide
              aria-label="Filter apps by category"
              options={[
                { value: ALL_APP_CATEGORIES_FILTER, label: "All apps" },
                ...categories.map((category) => ({ value: category, label: category })),
              ]}
            />
          </label>
        </div>
        <div className="sm:ml-auto">
          <AppsViewToggle value={viewMode} onChange={handleViewModeChange} />
        </div>
      </div>

      {totalVisible === 0 ? (
        <AdminListEmptyState
          variant="panel"
          hasSearch={hasSearch}
          hasFilter={hasCategoryFilter}
          entityName="apps"
        />
      ) : viewMode === "grid" ? (
        <div className={`${adminTableWrap} mt-6 p-3 sm:p-4`}>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleApps.map((app) => {
            const isDeleting = busyId === app.id;
            return (
            <li
              key={app.id}
              className={`ds-feature-card is-dashboard group p-3 sm:p-4 ${isDeleting ? "opacity-60" : ""}`}
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
                      <h2 className="truncate ds-body-sm font-semibold">{app.label}</h2>
                      <CategoryChip label={app.section} />
                      {app.isPrivate ? (
                        <span className="ds-status-pill shrink-0 text-[10px]">
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
                    className="ds-btn-icon" style={{ width: 28, height: 28 }}
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
                    {app.temporaryUrl ? (
                      <TemporaryUrlIconButton label={app.label} url={app.temporaryUrl} />
                    ) : null}
                    {app.gensparkUrl ? (
                      <GensparkIconButton
                        label={app.label}
                        url={app.gensparkUrl}
                        onOpen={openUrlSlidePanel}
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
      ) : (
        <div className={`${adminTableWrap} mt-6`}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>App</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Link</th>
                  <th className="is-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleApps.map((app) => {
                  const isDeleting = busyId === app.id;
                  return (
                    <tr key={app.id} className={isDeleting ? "opacity-60" : undefined}>
                      <td>
                        <a
                          href={app.href}
                          className="flex min-w-0 items-center gap-3 no-underline hover:no-underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <AppListIcon label={app.label} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-[var(--ds-ink)]">{app.label}</span>
                            {app.isPrivate ? (
                              <span className="ds-status-pill mt-1 inline-flex text-[10px]">Private</span>
                            ) : null}
                          </span>
                        </a>
                      </td>
                      <td>
                        <CategoryChip label={app.section} />
                      </td>
                      <td className="max-w-xs text-[var(--ds-body)]">
                        <span className="line-clamp-2">{app.description}</span>
                      </td>
                      <td className="font-mono text-xs text-[var(--ds-body)]">
                        <span className="line-clamp-1 break-all">{app.href}</span>
                      </td>
                      <td className="is-actions">
                        <AppRowActions
                          app={app}
                          isDeleting={isDeleting}
                          onDelete={() => void deleteApp(app)}
                          onOpenSlide={openUrlSlidePanel}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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