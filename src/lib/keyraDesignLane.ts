export type KeyraDesignLane = "consumer" | "enterprise" | "developer";

const LANE_HEADER = "x-keyra-design-lane";

export function keyraDesignLaneFromPathname(pathname: string): KeyraDesignLane {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p.startsWith("/admin")) return "enterprise";
  if (p.startsWith("/global-deployment")) return "enterprise";
  if (p.startsWith("/developers")) return "developer";
  return "consumer";
}

export function parseKeyraDesignLaneHeader(value: string | null): KeyraDesignLane {
  if (value === "enterprise" || value === "developer" || value === "consumer") return value;
  return "consumer";
}

export { LANE_HEADER };
