"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { useToast } from "@/components/ui/Toast";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import {
  normalizeDeploymentAppCategory,
  type DeploymentAppCategoryView,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { ManageCategoriesModal } from "./ManageCategoriesModal";
import {
  adminBody,
  adminCheckbox,
  adminFormCheckboxLabel,
  adminFormInput,
  adminLabel,
  adminLegacyInput,
  adminSectionTitle,
} from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";
import { saveDeploymentAppAction } from "./actions";

type Props = {
  mode: "create" | "edit";
  app?: DeploymentAppView;
  categories: DeploymentAppCategoryView[];
  headerAside?: ReactNode;
};

function sortCategories(categories: DeploymentAppCategoryView[]): DeploymentAppCategoryView[] {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function defaultCategorySection(
  app: DeploymentAppView | undefined,
  categories: DeploymentAppCategoryView[],
): string {
  if (app?.section) return app.section;
  const sorted = sortCategories(categories);
  return sorted[0]?.name ?? "";
}

export function AppForm({ mode, app, categories, headerAside }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [label, setLabel] = useState(app?.label ?? "");
  const [description, setDescription] = useState(app?.description ?? "");
  const [href, setHref] = useState(app?.href ?? "");
  const [gensparkUrl, setGensparkUrl] = useState(app?.gensparkUrl ?? "");
  const [temporaryUrl, setTemporaryUrl] = useState(app?.temporaryUrl ?? "");
  const [section, setSection] = useState(() => defaultCategorySection(app, categories));
  const [categoryList, setCategoryList] = useState(() => sortCategories(categories));
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(app?.isPrivate ?? false);
  const [isActive, setIsActive] = useState(app?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass = adminFormInput;
  const selectClass = adminLegacyInput;

  const categoryOptions = useMemo(() => {
    const byName = new Map(categoryList.map((item) => [item.name, item]));
    if (app?.section && !byName.has(app.section)) {
      byName.set(app.section, { name: app.section, sortOrder: 9999 });
    }
    return sortCategories(Array.from(byName.values()));
  }, [categoryList, app?.section]);

  useEffect(() => {
    if (mode !== "edit" || !app) return;
    setIsActive(app.isActive);
    setIsPrivate(app.isPrivate);
  }, [app?.id, app?.isActive, app?.isPrivate, mode]);

  function handleCategoriesChange(nextCategories: DeploymentAppCategoryView[], nextSelected?: string) {
    setCategoryList(sortCategories(nextCategories));
    if (nextSelected !== undefined) setSection(nextSelected);
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const resolvedSection = normalizeDeploymentAppCategory(section);
    if (!resolvedSection) {
      setSaving(false);
      setError("Category is required.");
      return;
    }

    const result = await saveDeploymentAppAction({
      mode,
      appId: app?.id,
      label,
      description,
      href,
      gensparkUrl: gensparkUrl.trim() || null,
      temporaryUrl: temporaryUrl.trim() || null,
      section: resolvedSection,
      isPrivate,
      isActive,
      ...(mode === "edit" && app ? { sortOrder: app.sortOrder } : {}),
    });
    setSaving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    showAdminActionToast(
      toast,
      mode === "edit" ? "saved" : "created",
      "app",
      { name: label.trim() },
    );
    router.push("/admin/deployments/apps");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={adminSectionTitle}>{mode === "edit" ? "App details" : "New app"}</h2>
          <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
            Same fields as {mode === "edit" ? "create" : "the app edit screen"}. Optional URLs open from the apps
            directory.
          </p>
        </div>
        {headerAside ? <div className="shrink-0">{headerAside}</div> : null}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-4">
        <AdminFormField label="App name" htmlFor="app-name" required>
          <input
            id="app-name"
            className={inputClass}
            placeholder="Example: Billing"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
          />
        </AdminFormField>

        <AdminFormField label="Description" htmlFor="app-description" required>
          <input
            id="app-description"
            className={inputClass}
            placeholder="Short app purpose"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </AdminFormField>

        <AdminFormField label="Redirect URL" htmlFor="app-href" required>
          <input
            id="app-href"
            className={inputClass}
            placeholder="https://example.keyra.ie"
            type="url"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            required
          />
        </AdminFormField>

        <AdminFormField label="Genspark URL" htmlFor="app-genspark-url">
          <input
            id="app-genspark-url"
            className={inputClass}
            placeholder="Optional — https://genspark.example.com"
            type="url"
            value={gensparkUrl}
            onChange={(event) => setGensparkUrl(event.target.value)}
          />
        </AdminFormField>

        <AdminFormField label="Temporary URL" htmlFor="app-temporary-url">
          <input
            id="app-temporary-url"
            className={inputClass}
            placeholder="Optional — https://staging.example.keyra.ie"
            type="url"
            value={temporaryUrl}
            onChange={(event) => setTemporaryUrl(event.target.value)}
          />
        </AdminFormField>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="app-category" className={adminLabel}>
              Category
            </label>
            <button
              type="button"
              onClick={() => setManageCategoriesOpen(true)}
              className="ds-btn-secondary is-sm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Manage categories
            </button>
          </div>
          <select
            id="app-category"
            className={selectClass}
            value={section}
            onChange={(event) => setSection(event.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categoryOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <label className={cn(adminFormCheckboxLabel, "items-start")}>
          <input
            type="checkbox"
            className={`${adminCheckbox} mt-0.5`}
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>
            <span className="block font-medium text-[var(--ds-ink)]">Active</span>
            <span className={`${adminBody} mt-1 block text-[var(--ds-body)]`}>
              Show in the 9-dot launcher and public apps list. Uncheck to hide from both without deleting.
            </span>
          </span>
        </label>

        <label className={cn(adminFormCheckboxLabel, "items-start")}>
          <input
            type="checkbox"
            className={`${adminCheckbox} mt-0.5`}
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.target.checked)}
          />
          <span>
            <span className="block font-medium text-[var(--ds-ink)]">Private app</span>
            <span className={`${adminBody} mt-1 block text-[var(--ds-body)]`}>
              Hide from the 9-dot launcher only. The app stays in admin; it must also be active to appear in the launcher.
            </span>
          </span>
        </label>

        {error ? <p className="ds-admin-error-banner">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create app"}
          </Button>
          <Link href="/admin/deployments/apps" className="ds-btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      <ManageCategoriesModal
        open={manageCategoriesOpen}
        onClose={() => setManageCategoriesOpen(false)}
        categories={categoryList}
        selectedCategory={section}
        onCategoriesChange={handleCategoriesChange}
      />
    </>
  );
}
