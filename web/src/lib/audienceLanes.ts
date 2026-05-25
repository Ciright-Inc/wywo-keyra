/** Deep-link targets for the global audience switcher (routes must stay stable). */
import { keyraGlobalDeploymentUrl } from "@/lib/keyraAppUrls";

export const AUDIENCE_LANE_HREFS = {
  enterprise: keyraGlobalDeploymentUrl(),
  ecosystem: "/partners",
} as const;

export const AUDIENCE_LANE_LABELS = {
  enterprise: "Governments",
  ecosystem: "Partners",
} as const;
