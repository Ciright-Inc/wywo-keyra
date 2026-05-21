export const DEPLOYMENT_APP_SECTIONS = ["Core apps", "Media & engagement", "Operations"] as const;

export const DEPLOYMENT_APP_CATEGORY_MAX_LENGTH = 80;

/** Sentinel select value — not persisted. */
export const CREATE_NEW_APP_CATEGORY = "__create_new_category__";

export type DeploymentAppCategoryView = {
  name: string;
  sortOrder: number;
};

export type DeploymentAppView = {
  id: string;
  label: string;
  description: string;
  href: string;
  gensparkUrl: string | null;
  section: string;
  sortOrder: number;
  isPrivate: boolean;
  createdAt: string;
};

/** Filter sentinel for the apps directory category dropdown. */
export const ALL_APP_CATEGORIES_FILTER = "__all_apps__";

/** Default categories first (fixed order), then any custom names from the database. */
export function mergeDeploymentAppCategories(extra: string[] = []): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const name of DEPLOYMENT_APP_SECTIONS) {
    seen.add(name);
    merged.push(name);
  }

  const custom = extra
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && !seen.has(value))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  for (const name of custom) {
    seen.add(name);
    merged.push(name);
  }

  return merged;
}

export function normalizeDeploymentAppCategory(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
