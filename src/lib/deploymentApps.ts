import type { DeploymentApp } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  DEPLOYMENT_APP_CATEGORY_MAX_LENGTH,
  DEPLOYMENT_APP_SECTIONS,
  normalizeDeploymentAppCategory,
  type DeploymentAppCategoryView,
  type DeploymentAppView,
} from "@/lib/deploymentAppConstants";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";

const SECTION_BY_ID: Record<string, (typeof DEPLOYMENT_APP_SECTIONS)[number]> = {
  keyra: "Core apps",
  "get-started": "Core apps",
  developer: "Core apps",
  settings: "Core apps",
  "my-account": "Core apps",
  app: "Core apps",
  authenticator: "Core apps",
  admin: "Core apps",
  press: "Media & engagement",
  affiliates: "Media & engagement",
  directors: "Media & engagement",
  video: "Media & engagement",
  event: "Media & engagement",
  podcast: "Media & engagement",
  ve: "Media & engagement",
  info: "Operations",
  "family-office": "Operations",
  ftp: "Operations",
  "jione-documents": "Operations",
  investor: "Operations",
  esim: "Operations",
  analytics: "Operations",
  drive: "Operations",
  soip: "Operations",
};

export type DeploymentAppInput = {
  label: string;
  description: string;
  href: string;
  gensparkUrl?: string | null;
  temporaryUrl?: string | null;
  section: string;
  isPrivate: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export function normalizeDeploymentAppId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isValidSection(section: string): boolean {
  const normalized = normalizeDeploymentAppCategory(section);
  return normalized.length > 0 && normalized.length <= DEPLOYMENT_APP_CATEGORY_MAX_LENGTH;
}

function parseOptionalHttpUrl(value: unknown, fieldLabel: string): string | null | { error: string } {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return { error: `${fieldLabel} must be a valid http(s) URL.` };
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
  } catch {
    return { error: `${fieldLabel} must be a valid http(s) URL.` };
  }
  return trimmed;
}

export function validateDeploymentAppInput(input: Partial<DeploymentAppInput>): DeploymentAppInput | { error: string } {
  const label = input.label?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const href = input.href?.trim() ?? "";
  const gensparkUrlResult = parseOptionalHttpUrl(input.gensparkUrl, "Genspark URL");
  const temporaryUrlResult = parseOptionalHttpUrl(input.temporaryUrl, "Temporary URL");
  const section = normalizeDeploymentAppCategory(input.section ?? "");
  const isPrivate = input.isPrivate === true;
  const isActive = typeof input.isActive === "boolean" ? input.isActive : true;
  const sortOrder = Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0;

  if (!label) return { error: "App name is required." };
  if (!description) return { error: "Description is required." };
  if (!href) return { error: "Redirect URL is required." };
  if (!section) return { error: "Category is required." };
  if (!isValidSection(section)) {
    return { error: `Category must be between 1 and ${DEPLOYMENT_APP_CATEGORY_MAX_LENGTH} characters.` };
  }
  if (gensparkUrlResult && typeof gensparkUrlResult === "object") {
    return gensparkUrlResult;
  }
  if (temporaryUrlResult && typeof temporaryUrlResult === "object") {
    return temporaryUrlResult;
  }
  try {
    const parsed = new URL(href);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
  } catch {
    return { error: "Redirect URL must be a valid http(s) URL." };
  }

  return {
    label,
    description,
    href,
    gensparkUrl: gensparkUrlResult,
    temporaryUrl: temporaryUrlResult,
    section,
    isPrivate,
    isActive,
    sortOrder,
  };
}

export async function ensureDeploymentAppsSeeded(): Promise<void> {
  const count = await prisma.deploymentApp.count();
  if (count > 0) return;

  const defaults = getKeyraAdminAppLinks().map((app, index) => ({
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
    section: SECTION_BY_ID[app.id] ?? "Operations",
    sortOrder: index,
    isPrivate: false,
    isActive: true,
  }));

  await prisma.deploymentApp.createMany({
    data: defaults,
    skipDuplicates: true,
  });
}

export async function ensureDeploymentAppCategoriesSeeded(): Promise<void> {
  await ensureDeploymentAppsSeeded();

  const defaults = DEPLOYMENT_APP_SECTIONS.map((name, index) => ({
    name,
    sortOrder: index,
  }));

  await prisma.deploymentAppCategory.createMany({
    data: defaults,
    skipDuplicates: true,
  });

  const appSections = await prisma.deploymentApp.findMany({
    where: { isActive: true },
    select: { section: true },
    distinct: ["section"],
  });

  for (const row of appSections) {
    const name = normalizeDeploymentAppCategory(row.section);
    if (!name || !isValidSection(name)) continue;
    await prisma.deploymentAppCategory.upsert({
      where: { name },
      create: { name, sortOrder: 100 },
      update: {},
    });
  }
}

export async function ensureDeploymentAppCategory(name: string): Promise<void> {
  const normalized = normalizeDeploymentAppCategory(name);
  if (!normalized || !isValidSection(normalized)) return;
  await ensureDeploymentAppCategoriesSeeded();
  await prisma.deploymentAppCategory.upsert({
    where: { name: normalized },
    create: { name: normalized, sortOrder: 100 },
    update: {},
  });
}

function parseDeploymentAppCategorySortOrder(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.trunc(value);
  if (rounded < 0 || rounded > 9999) return null;
  return rounded;
}

export async function listDeploymentAppCategoryViews(): Promise<DeploymentAppCategoryView[]> {
  await ensureDeploymentAppCategoriesSeeded();
  return prisma.deploymentAppCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, sortOrder: true },
  });
}

async function findDeploymentAppCategoryBySortOrder(
  sortOrder: number,
  excludeName?: string,
): Promise<{ name: string } | null> {
  const row = await prisma.deploymentAppCategory.findFirst({
    where: { sortOrder },
    select: { name: true },
  });
  if (!row) return null;
  if (excludeName && row.name === excludeName) return null;
  return row;
}

export async function createDeploymentAppCategoryFromInput(
  name: string,
  sortOrderInput?: number,
): Promise<DeploymentAppCategoryView | { error: string }> {
  const normalized = normalizeDeploymentAppCategory(name);
  if (!normalized) return { error: "Category name is required." };
  if (!isValidSection(normalized)) {
    return { error: `Category must be between 1 and ${DEPLOYMENT_APP_CATEGORY_MAX_LENGTH} characters.` };
  }

  const parsedSortOrder = parseDeploymentAppCategorySortOrder(sortOrderInput);
  if (parsedSortOrder === null) {
    return { error: "Order number is required and must be between 0 and 9999." };
  }

  await ensureDeploymentAppCategoriesSeeded();

  const existing = await prisma.deploymentAppCategory.findUnique({ where: { name: normalized } });
  if (existing) return { error: "Category name already exists." };

  const orderTaken = await findDeploymentAppCategoryBySortOrder(parsedSortOrder);
  if (orderTaken) return { error: "This order number is already used." };

  const category = await prisma.deploymentAppCategory.create({
    data: { name: normalized, sortOrder: parsedSortOrder },
    select: { name: true, sortOrder: true },
  });
  return category;
}

export async function updateDeploymentAppCategory(
  originalName: string,
  input: { name?: string; sortOrder?: number },
): Promise<DeploymentAppCategoryView | { error: string }> {
  await ensureDeploymentAppCategoriesSeeded();

  const currentName = normalizeDeploymentAppCategory(originalName);
  if (!currentName) return { error: "Category name is required." };

  const existing = await prisma.deploymentAppCategory.findUnique({ where: { name: currentName } });
  if (!existing) return { error: "Category not found." };

  const nextName =
    input.name !== undefined ? normalizeDeploymentAppCategory(input.name) : currentName;
  if (!nextName) return { error: "Category name is required." };
  if (!isValidSection(nextName)) {
    return { error: `Category must be between 1 and ${DEPLOYMENT_APP_CATEGORY_MAX_LENGTH} characters.` };
  }

  const nextSortOrder =
    input.sortOrder !== undefined
      ? parseDeploymentAppCategorySortOrder(input.sortOrder)
      : existing.sortOrder;
  if (nextSortOrder === null) {
    return { error: "Order number is required and must be between 0 and 9999." };
  }

  const orderTaken = await findDeploymentAppCategoryBySortOrder(nextSortOrder, currentName);
  if (orderTaken) return { error: "This order number is already used." };

  if (nextName !== currentName) {
    const nameTaken = await prisma.deploymentAppCategory.findUnique({ where: { name: nextName } });
    if (nameTaken) return { error: "Category name already exists." };

    await prisma.$transaction([
      prisma.deploymentAppCategory.create({
        data: { name: nextName, sortOrder: nextSortOrder },
      }),
      prisma.deploymentApp.updateMany({
        where: { section: currentName },
        data: { section: nextName },
      }),
      prisma.deploymentAppCategory.delete({ where: { name: currentName } }),
    ]);
  } else {
    await prisma.deploymentAppCategory.update({
      where: { name: currentName },
      data: { sortOrder: nextSortOrder },
    });
  }

  return { name: nextName, sortOrder: nextSortOrder };
}

export async function listDeploymentAppCategories(): Promise<string[]> {
  const rows = await listDeploymentAppCategoryViews();
  return rows.map((row) => row.name);
}

export async function countAppsInCategory(name: string): Promise<number> {
  const normalized = normalizeDeploymentAppCategory(name);
  if (!normalized) return 0;
  return prisma.deploymentApp.count({
    where: { isActive: true, section: normalized },
  });
}

export type DeleteDeploymentAppCategoryResult =
  | { ok: true }
  | { error: string; appCount?: number; needsReassign?: boolean };

export async function deleteDeploymentAppCategory(
  name: string,
  reassignTo?: string,
): Promise<DeleteDeploymentAppCategoryResult> {
  await ensureDeploymentAppCategoriesSeeded();

  const normalized = normalizeDeploymentAppCategory(name);
  if (!normalized) return { error: "Category name is required." };
  if (!isValidSection(normalized)) {
    return { error: `Category must be between 1 and ${DEPLOYMENT_APP_CATEGORY_MAX_LENGTH} characters.` };
  }

  const exists = await prisma.deploymentAppCategory.findUnique({ where: { name: normalized } });
  if (!exists) return { error: "Category not found." };

  const totalCategories = await prisma.deploymentAppCategory.count();
  if (totalCategories <= 1) {
    return { error: "At least one category must remain." };
  }

  const appCount = await countAppsInCategory(normalized);

  if (appCount > 0) {
    const target = normalizeDeploymentAppCategory(reassignTo ?? "");
    if (!target) {
      return {
        error: `${appCount} app${appCount === 1 ? "" : "s"} use this category. Choose a category to move them to.`,
        appCount,
        needsReassign: true,
      };
    }
    if (target === normalized) {
      return { error: "Choose a different category to move apps to." };
    }
    const targetExists = await prisma.deploymentAppCategory.findUnique({ where: { name: target } });
    if (!targetExists) return { error: "Target category not found." };

    await prisma.deploymentApp.updateMany({
      where: { isActive: true, section: normalized },
      data: { section: target },
    });
  }

  await prisma.deploymentAppCategory.delete({ where: { name: normalized } });
  return { ok: true };
}

export async function listDeploymentApps(
  options: { includePrivate?: boolean; newestFirst?: boolean; includeInactive?: boolean } = {},
): Promise<DeploymentApp[]> {
  await ensureDeploymentAppsSeeded();
  return prisma.deploymentApp.findMany({
    where: {
      ...(options.includeInactive ? {} : { isActive: true }),
      ...(options.includePrivate === false ? { isPrivate: false } : {}),
    },
    orderBy: options.newestFirst
      ? [{ createdAt: "desc" }, { label: "asc" }]
      : [{ section: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
}

/** 9-dot launcher — active, non-private apps only (same rules as `includePrivate: false`). */
export async function listDeploymentLauncherApps(): Promise<DeploymentApp[]> {
  return listDeploymentApps({ includePrivate: false });
}

export type DeploymentAppEditNeighbor = {
  id: string;
  label: string;
};

export async function getDeploymentAppEditNeighbors(appId: string): Promise<{
  index: number;
  total: number;
  prev: DeploymentAppEditNeighbor | null;
  next: DeploymentAppEditNeighbor | null;
}> {
  const apps = await listDeploymentApps({ newestFirst: true, includeInactive: true });
  const index = apps.findIndex((app) => app.id === appId);
  const pick = (app: DeploymentApp): DeploymentAppEditNeighbor => ({ id: app.id, label: app.label });

  return {
    index: index === -1 ? 0 : index + 1,
    total: apps.length,
    prev: index > 0 ? pick(apps[index - 1]!) : null,
    next: index >= 0 && index < apps.length - 1 ? pick(apps[index + 1]!) : null,
  };
}

export function toDeploymentAppView(app: DeploymentApp): DeploymentAppView {
  return {
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
    gensparkUrl: app.gensparkUrl,
    temporaryUrl: app.temporaryUrl,
    section: app.section,
    sortOrder: app.sortOrder,
    isPrivate: app.isPrivate,
    isActive: app.isActive,
    createdAt: app.createdAt.toISOString(),
  };
}
