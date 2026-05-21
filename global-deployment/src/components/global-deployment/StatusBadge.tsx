import type { DeploymentStatus } from "@prisma/client";
import { deploymentStatusPresentation } from "@/lib/deployments/status";

export function StatusBadge({ status, compact = false }: { status: DeploymentStatus; compact?: boolean }) {
  const p = deploymentStatusPresentation(status);
  const label =
    compact && status === "TVIP"
      ? "Validation pending"
      : compact && status === "INSTITUTIONAL_AWARENESS"
        ? "Institutional"
        : p.label;
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-tight sm:text-[11px] ${p.badgeClass}`}
      title={p.description}
    >
      <span className={`size-2 shrink-0 rounded-full ${p.dotClass}`} aria-hidden />
      <span className="text-balance">{label}</span>
      <span className="sr-only">{p.description}</span>
    </span>
  );
}
