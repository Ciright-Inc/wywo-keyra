import type { WywoTrustStatus } from "@prisma/client";
import { WYWO_TRUST_STATUS_LABELS } from "@/lib/wywo/constants";

type Props = {
  status: WywoTrustStatus;
  className?: string;
};

const VARIANT: Record<WywoTrustStatus, string> = {
  TRUSTED: "wywo-badge is-trusted",
  FAMILY_CIRCLE: "wywo-badge is-family",
  EXECUTIVE_RING: "wywo-badge is-executive",
  REFERRED: "wywo-badge is-referred",
  PENDING_REVIEW: "wywo-badge is-pending",
  UNKNOWN: "wywo-badge is-unknown",
  BLOCKED: "wywo-badge is-blocked",
  SUPPRESSED: "wywo-badge is-blocked",
  EXPIRED: "wywo-badge is-muted",
  REVOKED: "wywo-badge is-muted",
};

export function WywoTrustBadge({ status, className }: Props) {
  const variant = VARIANT[status] ?? "wywo-badge";
  return (
    <span className={`${variant}${className ? ` ${className}` : ""}`}>
      {WYWO_TRUST_STATUS_LABELS[status]}
    </span>
  );
}
