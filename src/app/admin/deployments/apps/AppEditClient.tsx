"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DeploymentAppCategoryView, DeploymentAppView } from "@/lib/deploymentAppConstants";
import { AppEditSiblingNav } from "./AppEditSiblingNav";
import { AppForm } from "./AppForm";

type SiblingApp = { id: string; label: string };

type Props = {
  initialApp: DeploymentAppView;
  categories: DeploymentAppCategoryView[];
  siblingApps: SiblingApp[];
};

function neighborsFor(appId: string, siblings: SiblingApp[]) {
  const index = siblings.findIndex((item) => item.id === appId);
  return {
    index: index === -1 ? 0 : index + 1,
    total: siblings.length,
    prev: index > 0 ? siblings[index - 1]! : null,
    next: index >= 0 && index < siblings.length - 1 ? siblings[index + 1]! : null,
  };
}

function normalizeApp(raw: DeploymentAppView): DeploymentAppView {
  return {
    id: raw.id,
    label: raw.label,
    description: raw.description,
    href: raw.href,
    gensparkUrl: raw.gensparkUrl ?? null,
    section: raw.section,
    sortOrder: raw.sortOrder ?? 0,
    isPrivate: raw.isPrivate ?? false,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date(raw.createdAt).toISOString(),
  };
}

export function AppEditClient({ initialApp, categories, siblingApps }: Props) {
  const cacheRef = useRef(new Map<string, DeploymentAppView>([[initialApp.id, initialApp]]));
  const [app, setApp] = useState(initialApp);
  const nav = useMemo(() => neighborsFor(app.id, siblingApps), [app.id, siblingApps]);

  const prefetchApp = useCallback(async (id: string) => {
    if (cacheRef.current.has(id)) return;
    try {
      const res = await fetch(`/api/admin/deployments/apps/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { app?: DeploymentAppView };
      if (data.app) cacheRef.current.set(id, normalizeApp(data.app));
    } catch {
      /* ignore prefetch errors */
    }
  }, []);

  const navigateTo = useCallback(async (id: string) => {
    const cached = cacheRef.current.get(id);
    if (cached) {
      setApp(cached);
      window.history.replaceState(null, "", `/admin/deployments/apps/${id}/edit`);
      return;
    }
    const res = await fetch(`/api/admin/deployments/apps/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { app?: DeploymentAppView };
    if (!data.app) return;
    const nextApp = normalizeApp(data.app);
    cacheRef.current.set(id, nextApp);
    setApp(nextApp);
    window.history.replaceState(null, "", `/admin/deployments/apps/${id}/edit`);
  }, []);

  useEffect(() => {
    if (nav.prev) void prefetchApp(nav.prev.id);
    if (nav.next) void prefetchApp(nav.next.id);
  }, [nav.prev, nav.next, prefetchApp]);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/deployments/apps"
        className="text-sm font-medium text-keyra-text-2 underline-offset-4 transition hover:text-keyra-primary hover:underline"
      >
        &lt;- Back to apps
      </Link>

      <div className="mt-6 rounded-3xl border border-keyra-border bg-keyra-surface p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">App directory</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary">Edit app</h1>
            <p className="mt-3 text-sm leading-6 text-keyra-text-2">
              Update the app details. Saved changes are stored in the database.
            </p>
          </div>
          <AppEditSiblingNav
            prevApp={nav.prev}
            nextApp={nav.next}
            index={nav.index}
            total={nav.total}
            onNavigate={navigateTo}
          />
        </div>

        <AppForm key={app.id} mode="edit" app={app} categories={categories} />
      </div>
    </div>
  );
}
