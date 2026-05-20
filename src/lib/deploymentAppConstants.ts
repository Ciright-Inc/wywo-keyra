export const DEPLOYMENT_APP_SECTIONS = ["Core apps", "Media & engagement", "Operations"] as const;

export type DeploymentAppView = {
  id: string;
  label: string;
  description: string;
  href: string;
  section: string;
  sortOrder: number;
  isPrivate: boolean;
};
