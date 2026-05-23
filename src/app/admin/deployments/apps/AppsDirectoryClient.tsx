"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ALL_APP_CATEGORIES_FILTER,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { deleteDeploymentAppAction, setDeploymentAppActiveAction } from "./actions";
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
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

type AppsViewMode = "grid" | "list";

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

function AppActiveToggle({
  app,
  disabled,
  errorMessage,
  onToggle,
  className,
}: {
  app: DeploymentAppView;
  disabled?: boolean;
  errorMessage?: string | null;
  onToggle: (app: DeploymentAppView, nextActive: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-col items-center gap-0.5", className)}>
      <label
        className="inline-flex cursor-pointer items-center justify-center"
        title={errorMessage ?? "Active"}
      >
        <input
          type="checkbox"
          className={adminCheckbox}
          checked={app.isActive}
          disabled={disabled}
          aria-label={`${app.label} active`}
          aria-invalid={errorMessage ? true : undefined}
          onChange={(event) => onToggle(app, event.target.checked)}
        />
      </label>
      {errorMessage ? (
        <span className="max-w-[9rem] text-center text-[10px] leading-tight text-[var(--ds-error)]" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}

function AppListRowActions({
  app,
  isDeleting,
  onDelete,
}: {
  app: DeploymentAppView;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <RowActions
      editHref={`/admin/deployments/apps/${app.id}/edit`}
      editAriaLabel={`Edit ${app.label}`}
      canDelete
      deleteAriaLabel={`Delete ${app.label}`}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  );
}

function AppListIcon({ label, compact = false }: { label: string; compact?: boolean }) {
  const sizeClass = compact ? "size-8" : "size-10";
  const textClass = compact ? "text-[9px]" : "text-[10px]";
  return (
    <span
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] text-xs font-semibold text-[var(--ds-ink)]`}
    >
      <Image
        src="/keyra-app-mark.png"
        alt=""
        fill
        sizes={compact ? "32px" : "40px"}
        className="scale-[1.18] object-contain opacity-35"
        aria-hidden
        unoptimized
      />
      <span className={`relative rounded-sm bg-white px-0.5 py-0.5 ${textClass} leading-none shadow-sm ring-1 ring-black/[0.06]`}>
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

const appLinkActionClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-[var(--ds-radius-md)] px-2 py-1.5 text-xs font-medium text-[var(--ds-body)] no-underline transition hover:bg-[var(--ds-canvas-soft)] hover:text-[var(--ds-ink)]";

const appLinkIconOnlyClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-body)] transition hover:bg-[var(--ds-canvas-soft)] hover:text-[var(--ds-ink)]";

function AppLinkActionIcon({ kind }: { kind: "active" | "temporary" | "genspark" }) {
  if (kind === "active") {
    return (
      <svg className="block size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "temporary") {
    return (
      <svg
        className="block size-3.5 shrink-0"
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
    );
  }

  return (
    <svg
      className="block size-3.5 shrink-0"
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
  );
}

function AppLinkIconCell({
  kind,
  label,
  url,
  onOpenSlide,
  compact = false,
}: {
  kind: "active" | "temporary" | "genspark";
  label: string;
  url: string | null;
  onOpenSlide?: (payload: { url: string; label: string }) => void;
  compact?: boolean;
}) {
  if (!url) {
    return compact ? null : <span className="text-[var(--ds-muted)]">—</span>;
  }

  const actionLabel =
    kind === "active" ? "Open" : kind === "temporary" ? "Temporary" : "Slides";
  const actionClass = compact ? appLinkIconOnlyClass : appLinkActionClass;

  if (kind === "genspark") {
    return (
      <button
        type="button"
        className={actionClass}
        title={url}
        aria-label={`Open slides for ${label}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenSlide?.({ url, label });
        }}
      >
        <AppLinkActionIcon kind="genspark" />
        {!compact ? <span>{actionLabel}</span> : null}
      </button>
    );
  }

  return (
    <a
      href={url}
      className={actionClass}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      aria-label={`Open ${kind === "active" ? "active" : "temporary"} link for ${label}`}
      onClick={(event) => event.stopPropagation()}
    >
      <AppLinkActionIcon kind={kind} />
      {!compact ? <span>{actionLabel}</span> : null}
    </a>
  );
}

function AppGridCard({
  app,
  isDeleting,
  toggleError,
  onDelete,
  onOpenSlide,
  onToggleActive,
}: {
  app: DeploymentAppView;
  isDeleting: boolean;
  toggleError?: string | null;
  onDelete: () => void;
  onOpenSlide: (payload: { url: string; label: string }) => void;
  onToggleActive: (app: DeploymentAppView, nextActive: boolean) => void;
}) {
  return (
    <li
      className={cn(
        "ds-feature-card is-dashboard ds-app-grid-card",
        isDeleting && "opacity-60",
      )}
    >
      <a
        href={app.href}
        className="flex min-w-0 items-center gap-2 no-underline hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <AppListIcon label={app.label} compact />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-sm font-semibold text-[var(--ds-ink)]">{app.label}</h2>
            <CategoryChip label={app.section} />
            {app.isPrivate ? (
              <span className="ds-status-pill shrink-0 text-[10px]">Private</span>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ds-body)]">{app.description}</p>
        </div>
      </a>

      <div className="ds-app-grid-card__footer flex items-center justify-between gap-2 border-t border-[var(--ds-hairline)]">
        <AppActiveToggle
          app={app}
          disabled={isDeleting}
          errorMessage={toggleError}
          onToggle={onToggleActive}
          className="shrink-0"
        />
        <div className="inline-flex min-w-0 flex-wrap items-center justify-end gap-0.5">
          <AppLinkIconCell kind="active" label={app.label} url={app.href} compact />
          <AppLinkIconCell kind="temporary" label={app.label} url={app.temporaryUrl} compact />
          <AppLinkIconCell
            kind="genspark"
            label={app.label}
            url={app.gensparkUrl}
            onOpenSlide={onOpenSlide}
            compact
          />
          <AppListRowActions app={app} isDeleting={isDeleting} onDelete={onDelete} />
        </div>
      </div>
    </li>
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
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_APP_CATEGORIES_FILTER);
  const [gensparkPanel, setGensparkPanel] = useState<{ url: string; label: string } | null>(null);
  const [viewMode, setViewMode] = useState<AppsViewMode>("list");

  function handleViewModeChange(mode: AppsViewMode) {
    setViewMode(mode);
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

  async function toggleAppActive(app: DeploymentAppView, nextActive: boolean) {
    if (!nextActive) {
      if (
        !(await confirm({
          message: `Deactivate "${app.label}"? It will be hidden from the apps directory and launcher.`,
          confirmLabel: "Deactivate",
        }))
      ) {
        return;
      }
    }

    setToggleErrors((current) => {
      if (!current[app.id]) return current;
      const next = { ...current };
      delete next[app.id];
      return next;
    });
    setBusyId(app.id);
    try {
      const result = await setDeploymentAppActiveAction(app.id, nextActive);
      if ("error" in result) {
        throw new Error(result.error);
      }

      setApps((current) =>
        current.map((item) => (item.id === app.id ? { ...item, isActive: result.isActive } : item)),
      );
      showAdminActionToast(toast, "saved", "app", { name: app.label });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save active status.";
      setToggleErrors((current) => ({ ...current, [app.id]: message }));
      toast.error("Unable to save", message);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteApp(app: DeploymentAppView) {
    if (!(await confirm(deleteDeploymentAppMessage(app.label)))) return;
    setBusyId(app.id);
    try {
      const result = await deleteDeploymentAppAction(app.id);
      if ("error" in result) {
        throw new Error(result.error);
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
      <div className={adminPanel}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={adminPageTitle}>Apps</h1>
              <span className={adminCountBadge}>
                {hasSearch || hasCategoryFilter ? `${totalVisible} of ${apps.length}` : apps.length}
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              Select an app to open its configured destination. Newly created apps appear first.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
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

        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--ds-hairline)] pt-5 sm:flex-row sm:items-center">
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
      </div>

      {totalVisible === 0 ? (
        <AdminListEmptyState
          variant="panel"
          hasSearch={hasSearch}
          hasFilter={hasCategoryFilter}
          entityName="apps"
        />
      ) : viewMode === "grid" ? (
        <div className={`${adminTableWrap} mt-3 p-2 sm:p-3`}>
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visibleApps.map((app) => {
            const isDeleting = busyId === app.id;
            return (
              <AppGridCard
                key={app.id}
                app={app}
                isDeleting={isDeleting}
                toggleError={toggleErrors[app.id]}
                onDelete={() => void deleteApp(app)}
                onOpenSlide={openUrlSlidePanel}
                onToggleActive={(target, nextActive) => void toggleAppActive(target, nextActive)}
              />
            );
          })}
          </ul>
        </div>
      ) : (
        <div className={`${adminTableWrap} mt-3`}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>App</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Active link</th>
                  <th>Temporary link</th>
                  <th>Genspark link</th>
                  <th className="text-center">Active</th>
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
                      <td>
                        <AppLinkIconCell kind="active" label={app.label} url={app.href} />
                      </td>
                      <td>
                        <AppLinkIconCell kind="temporary" label={app.label} url={app.temporaryUrl} />
                      </td>
                      <td>
                        <AppLinkIconCell
                          kind="genspark"
                          label={app.label}
                          url={app.gensparkUrl}
                          onOpenSlide={openUrlSlidePanel}
                        />
                      </td>
                      <td className="text-center">
                        <AppActiveToggle
                          app={app}
                          disabled={isDeleting}
                          errorMessage={toggleErrors[app.id]}
                          onToggle={(target, nextActive) => void toggleAppActive(target, nextActive)}
                          className="justify-center"
                        />
                      </td>
                      <td className="is-actions">
                        <AppListRowActions
                          app={app}
                          isDeleting={isDeleting}
                          onDelete={() => void deleteApp(app)}
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