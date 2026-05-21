"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  normalizeDeploymentAppCategory,
  type DeploymentAppCategoryView,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { ManageCategoriesModal } from "./ManageCategoriesModal";

type Props = {
  mode: "create" | "edit";
  app?: DeploymentAppView;
  categories: DeploymentAppCategoryView[];
};

function sortCategories(categories: DeploymentAppCategoryView[]): DeploymentAppCategoryView[] {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function AppForm({ mode, app, categories }: Props) {
  const router = useRouter();
  const [label, setLabel] = useState(app?.label ?? "");
  const [description, setDescription] = useState(app?.description ?? "");
  const [href, setHref] = useState(app?.href ?? "");
  const [gensparkUrl, setGensparkUrl] = useState(app?.gensparkUrl ?? "");
  const [section, setSection] = useState(app?.section ?? "");
  const [categoryList, setCategoryList] = useState(() => sortCategories(categories));
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(app?.isPrivate ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    const byName = new Map(categoryList.map((item) => [item.name, item]));
    if (app?.section && !byName.has(app.section)) {
      byName.set(app.section, { name: app.section, sortOrder: 9999 });
    }
    return sortCategories(Array.from(byName.values()));
  }, [categoryList, app?.section]);

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

    const endpoint =
      mode === "edit" && app
        ? `/api/admin/deployments/apps/${encodeURIComponent(app.id)}`
        : "/api/admin/deployments/apps";
    const res = await fetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        label,
        description,
        href,
        gensparkUrl: gensparkUrl.trim() || null,
        section: resolvedSection,
        isPrivate,
      }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);

    if (!res.ok) {
      setError(data?.error ?? "Unable to save app.");
      return;
    }

    router.push("/admin/deployments/apps");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <label className="block text-sm font-medium text-keyra-text-2">
          App name
          <input
            className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            placeholder="Example: Billing"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-keyra-text-2">
          Description
          <input
            className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            placeholder="Short app purpose"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-keyra-text-2">
          Redirect URL
          <input
            className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            placeholder="https://example.keyra.ie"
            type="url"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-keyra-text-2">
          Genspark URL
          <span className="ml-1 text-xs font-normal text-keyra-text-2">(optional)</span>
          <input
            className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            placeholder="https://genspark.example.com"
            type="url"
            value={gensparkUrl}
            onChange={(event) => setGensparkUrl(event.target.value)}
          />
        </label>

        <div className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-keyra-text-2" htmlFor="app-category">
              Category
            </label>
            <button
              type="button"
              onClick={() => setManageCategoriesOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-keyra-border bg-keyra-surface px-3 py-1.5 text-xs font-medium text-keyra-primary transition hover:border-black/20"
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
            className="h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
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

        <label className="flex items-start gap-3 rounded-2xl border border-keyra-border bg-keyra-bg px-4 py-3 text-sm text-keyra-text-2">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-keyra-border accent-keyra-primary"
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.target.checked)}
          />
          <span>
            <span className="block font-medium text-keyra-primary">Private app</span>
            <span className="mt-1 block text-xs leading-5">
              Hide this app from the 9-dot app launcher. It will still appear here in admin.
            </span>
          </span>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)] disabled:opacity-60"
          >
            {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create app"}
          </button>
          <Link
            href="/admin/deployments/apps"
            className="rounded-full border border-keyra-border bg-keyra-bg px-4 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20"
          >
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
