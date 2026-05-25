"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { adminPanel } from "@/lib/admin/adminUiClasses";
import type { DeploymentAppCategoryView, DeploymentAppView } from "@/lib/deploymentAppConstants";
import { AppEditSiblingNav } from "./AppEditSiblingNav";
import { AppForm } from "./AppForm";
import { getDeploymentAppAction } from "./actions";

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
    temporaryUrl: raw.temporaryUrl ?? null,
    section: raw.section,
    sortOrder: raw.sortOrder ?? 0,
    isPrivate: raw.isPrivate ?? false,
    isActive: raw.isActive ?? true,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date(raw.createdAt).toISOString(),
  };
}

export function AppEditClient({ initialApp, categories, siblingApps }: Props) {
  const cacheRef = useRef(new Map<string, DeploymentAppView>([[initialApp.id, initialApp]]));
  const [app, setApp] = useState(initialApp);
  const nav = useMemo(() => neighborsFor(app.id, siblingApps), [app.id, siblingApps]);

  useEffect(() => {
    const normalized = normalizeApp(initialApp);
    cacheRef.current.set(normalized.id, normalized);
    setApp(normalized);
  }, [initialApp]);

  const prefetchApp = useCallback(async (id: string) => {
    if (cacheRef.current.has(id)) return;
    try {
      const data = await getDeploymentAppAction(id);
      if ("error" in data) return;
      cacheRef.current.set(id, normalizeApp(data));
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
    const data = await getDeploymentAppAction(id);
    if ("error" in data) return;
    const nextApp = normalizeApp(data);
    cacheRef.current.set(id, nextApp);
    setApp(nextApp);
    window.history.replaceState(null, "", `/admin/deployments/apps/${id}/edit`);
  }, []);

  useEffect(() => {
    if (nav.prev) void prefetchApp(nav.prev.id);
    if (nav.next) void prefetchApp(nav.next.id);
  }, [nav.prev, nav.next, prefetchApp]);

  return (
    <div>
      <AdminEditPageHeader
        title="Edit app"
        subtitle={app.label}
        backHref="/admin/deployments/apps"
      />

      <div className={`${adminPanel} mt-6`}>
        <AppForm
          key={app.id}
          mode="edit"
          app={app}
          categories={categories}
          headerAside={
            <AppEditSiblingNav
              prevApp={nav.prev}
              nextApp={nav.next}
              index={nav.index}
              total={nav.total}
              onNavigate={navigateTo}
            />
          }
        />
      </div>
    </div>
  );
}
