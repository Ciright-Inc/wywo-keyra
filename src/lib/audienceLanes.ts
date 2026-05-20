/** Deep-link targets for the global audience switcher (routes must stay stable). */
export const AUDIENCE_LANE_HREFS = {
  enterprise: "/global-deployment",
  ecosystem: "/partners",
} as const;

export const AUDIENCE_LANE_LABELS = {
  enterprise: "Governments",
  ecosystem: "Partners",
} as const;
