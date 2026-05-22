import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DeploymentAdminRole } from "@prisma/client";

export type AdminUsersSeedScope = {
  regionSlugs?: string[];
  countryIso2s?: string[];
  /** Country ISO2 + telco slug, e.g. `IE:eir`. */
  telcoKeys?: string[];
};

export type AdminUsersSeedUser = {
  email: string;
  displayName: string;
  phoneE164?: string | null;
  role: DeploymentAdminRole;
  isActive?: boolean;
  scope?: AdminUsersSeedScope;
};

export type AdminUsersSeedFile = {
  version: number;
  users: AdminUsersSeedUser[];
};

export function loadAdminUsersSeed(): AdminUsersSeedFile {
  const p = join(process.cwd(), "prisma", "data", "admin-users-seed.json");
  const raw = readFileSync(p, "utf8");
  return JSON.parse(raw) as AdminUsersSeedFile;
}
