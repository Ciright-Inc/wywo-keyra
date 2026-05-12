import type { DeploymentStatus } from "@prisma/client";
import { deploymentStatusPresentation } from "@/lib/deployments/status";

export function StatusBadge({ status }: { status: DeploymentStatus }) {
  const p = deploymentStatusPresentation(status);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${p.badgeClass}`}
      title={p.description}
    >
      <span className={`size-2 rounded-full ${p.dotClass}`} aria-hidden />
      <span>{p.label}</span>
      <span className="sr-only">{p.description}</span>
    </span>
  );
}
