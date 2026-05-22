"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { adminPanel } from "@/lib/admin/adminUiClasses";
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
      <AdminEditPageHeader
        title="Edit app"
        subtitle={app.label}
        backHref="/admin/deployments/apps"
        backLabel="Back to apps"
      />

      <div className={`${adminPanel} mt-6`}>
        <div className="flex flex-wrap items-start justify-end gap-4">
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
