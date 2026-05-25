import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";

const SECTION_BY_ID: Record<string, string> = {
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

export type DefaultDeploymentAppRow = {
  id: string;
  label: string;
  description: string;
  href: string;
  section: string;
  sortOrder: number;
  isPrivate: boolean;
  isActive: boolean;
};

/** Canonical app directory rows — used for first boot and syncing new ecosystem apps (e.g. SOIP). */
export function buildDefaultDeploymentAppRows(): DefaultDeploymentAppRow[] {
  return getKeyraAdminAppLinks().map((app, index) => ({
    id: app.id,
    label: app.label,
    description: app.description,
    href: app.href,
    section: SECTION_BY_ID[app.id] ?? "Operations",
    sortOrder: index,
    isPrivate: false,
    isActive: true,
  }));
}
