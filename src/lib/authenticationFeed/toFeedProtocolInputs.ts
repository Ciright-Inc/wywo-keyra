import type { SatProtocol } from "@prisma/client";
import type { FeedProtocolInput } from "@/lib/authenticationFeed/types";

/** Map DB rows to feed inputs: only protocols marked active (“live”) in SAT protocols admin. */
export function toFeedProtocolInputs(protocols: SatProtocol[]): FeedProtocolInput[] {
  return protocols
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      protocolCode: p.protocolCode,
      protocolName: p.protocolName,
      protocolCategory: p.protocolCategory,
      active: true,
      percentageWeight: p.percentageWeight,
      homePercentage: p.homePercentage,
      roamingPercentage: p.roamingPercentage,
    }));
}
