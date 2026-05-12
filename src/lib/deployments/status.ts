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
        dotClass: "bg-red-500",
        badgeClass:
          "border-red-500/40 bg-red-500/10 text-red-100 ring-1 ring-inset ring-red-500/25",
      };
    case "INSTITUTIONAL_AWARENESS":
      return {
        code: status,
        label: "Institutional Awareness",
        description: "Stakeholder awareness exists, not yet in technical validation.",
        dotClass: "bg-orange-500",
        badgeClass:
          "border-orange-500/40 bg-orange-500/10 text-orange-50 ring-1 ring-inset ring-orange-500/25",
      };
    case "TVIP":
      return {
        code: status,
        label: "Testing, Validation, Implementation Pending",
        description:
          "Technical or commercial validation underway; production not live.",
        dotClass: "bg-yellow-400",
        badgeClass:
          "border-yellow-400/45 bg-yellow-400/12 text-yellow-50 ring-1 ring-inset ring-yellow-400/30",
      };
    case "OPERATIONAL":
      return {
        code: status,
        label: "Operational",
        description: "Live or ready-for-live production deployment.",
        dotClass: "bg-emerald-500",
        badgeClass:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-50 ring-1 ring-inset ring-emerald-500/25",
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
