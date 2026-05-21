import type { DeploymentStatus } from "@prisma/client";

export type PublicStatusPresentation = {
  code: DeploymentStatus;
  label: string;
  description: string;
  dotClass: string;
  badgeClass: string;
};

const STATUS_ORDER: DeploymentStatus[] = [
  "IDENTIFIED",
  "INSTITUTIONAL_AWARENESS",
  "TVIP",
  "OPERATIONAL",
];

export function deploymentStatusPresentation(
  status: DeploymentStatus,
): PublicStatusPresentation {
  switch (status) {
    case "IDENTIFIED":
      return {
        code: status,
        label: "Identified",
        description: "Market or node identified, not institutionally activated.",
        dotClass: "bg-red-600",
        badgeClass:
          "border-red-800/28 bg-red-600/12 text-red-950 ring-1 ring-inset ring-red-800/20",
      };
    case "INSTITUTIONAL_AWARENESS":
      return {
        code: status,
        label: "Institutional Awareness",
        description: "Stakeholder awareness exists, not yet in technical validation.",
        dotClass: "bg-orange-500",
        badgeClass:
          "border-orange-800/30 bg-orange-500/14 text-orange-950 ring-1 ring-inset ring-orange-800/22",
      };
    case "TVIP":
      return {
        code: status,
        label: "Testing, Validation, Implementation Pending",
        description:
          "Technical or commercial validation underway; production not live.",
        dotClass: "bg-amber-500",
        badgeClass:
          "border-amber-700/32 bg-amber-400/18 text-amber-950 ring-1 ring-inset ring-amber-700/22",
      };
    case "OPERATIONAL":
      return {
        code: status,
        label: "Operational",
        description: "Live or ready-for-live production deployment.",
        dotClass: "bg-emerald-600",
        badgeClass:
          "border-emerald-800/30 bg-emerald-600/14 text-emerald-950 ring-1 ring-inset ring-emerald-800/22",
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function legendStatuses(): PublicStatusPresentation[] {
  return STATUS_ORDER.map((s) => deploymentStatusPresentation(s));
}
