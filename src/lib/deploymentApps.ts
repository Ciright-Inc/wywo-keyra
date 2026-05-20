import type { DeploymentApp } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DEPLOYMENT_APP_SECTIONS, type DeploymentAppView } from "@/lib/deploymentAppConstants";
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
};

export type DeploymentAppInput = {
  label: string;
  description: string;
  href: string;
  section: string;
  isPrivate: boolean;
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

function normalizeSection(section: string): string {
  return DEPLOYMENT_APP_SECTIONS.includes(section as (typeof DEPLOYMENT_APP_SECTIONS)[number])
    ? section
    : "Operations";
}

export function validateDeploymentAppInput(input: Partial<DeploymentAppInput>): DeploymentAppInput | { error: string } {
  const label = input.label?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const href = input.href?.trim() ?? "";
  const section = normalizeSection(input.section?.trim() ?? "");
  const isPrivate = input.isPrivate === true;
  const sortOrder = Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0;

  if (!label) return { error: "App name is required." };
  if (!description) return { error: "Description is required." };
  if (!href) return { error: "Redirect URL is required." };
  try {
    const parsed = new URL(href);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
  } catch {
    return { error: "Redirect URL must be a valid http(s) URL." };
  }

  return { label, description, href, section, isPrivate, sortOrder };
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

export async function listDeploymentApps(options: { includePrivate?: boolean } = {}): Promise<DeploymentApp[]> {
  await ensureDeploymentAppsSeeded();
  return prisma.deploymentApp.findMany({
    where: { isActive: true, ...(options.includePrivate === false ? { isPrivate: false } : {}) },
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
}

export function toDeploymentAppView(app: DeploymentApp): DeploymentAppView {
  return {
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
    section: app.section,
    sortOrder: app.sortOrder,
    isPrivate: app.isPrivate,
  };
}
