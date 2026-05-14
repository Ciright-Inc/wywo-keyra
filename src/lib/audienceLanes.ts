/** Deep-link targets for the global audience switcher (routes must stay stable). */
export const AUDIENCE_LANE_HREFS = {
  consumers: "/",
  enterprise: "/global-deployment",
  ecosystem: "/developers",
} as const;

export const AUDIENCE_LANE_LABELS = {
  consumers: "Consumers",
  enterprise: "Governments & carriers",
  ecosystem: "Partners & developers",
} as const;
