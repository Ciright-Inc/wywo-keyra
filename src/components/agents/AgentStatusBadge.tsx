import type { AgentOperationalStatus } from "@prisma/client";
import { labelForStatus } from "@/lib/agents/agentWorldConstants";
import { cn } from "@/components/ui/cn";

const STATUS_TONE: Partial<Record<AgentOperationalStatus, string>> = {
  ACTIVE: "text-[var(--ds-success)]",
  MARKETPLACE_READY: "text-[var(--ds-ink)]",
  APPROVED: "text-[var(--ds-ink)]",
  DEPLOYING: "text-[var(--ds-body)]",
  PENDING_APPROVAL: "text-[var(--ds-warning)]",
  SUSPENDED: "text-[var(--ds-muted)]",
  REVOKED: "text-[var(--ds-error)]",
  DRAFT: "text-[var(--ds-muted)]",
};

export function AgentStatusBadge({
  status,
  className,
}: {
  status: AgentOperationalStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "ds-badge-pill normal-case tracking-normal font-medium text-[11px]",
        STATUS_TONE[status] ?? "text-[var(--ds-body)]",
        className,
      )}
    >
      {labelForStatus(status)}
    </span>
  );
}
