import type { WywoTrustRing, WywoTrustStatus } from "@prisma/client";
import { withWywoActor } from "@/lib/wywo/apiHelpers";
import {
  listTrustContacts,
  ringForStatus,
  upsertContactTrust,
} from "@/lib/wywo/trust";

export const dynamic = "force-dynamic";

const RINGS: WywoTrustRing[] = [
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "TRUSTED_CONTACTS",
  "REFERRED_CONTACTS",
  "PENDING_UNKNOWNS",
  "BLOCKED_ENTITIES",
];
const STATUSES: WywoTrustStatus[] = [
  "TRUSTED",
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "REFERRED",
  "PENDING_REVIEW",
  "UNKNOWN",
  "BLOCKED",
  "SUPPRESSED",
  "EXPIRED",
  "REVOKED",
];

export async function GET(req: Request) {
  return withWywoActor(req, async (actor) => {
    const contacts = await listTrustContacts(actor.phoneE164);
    return { contacts };
  });
}

export async function POST(req: Request) {
  return withWywoActor(req, async (actor) => {
    const body = (await req.json()) as Record<string, unknown>;
    const contactPhone = String(body.contactPhone ?? "").trim();
    if (!contactPhone) throw new Error("contactPhone is required.");
    const trustStatus = STATUSES.includes(body.trustStatus as WywoTrustStatus)
      ? (body.trustStatus as WywoTrustStatus)
      : undefined;
    const trustRing = RINGS.includes(body.trustRing as WywoTrustRing)
      ? (body.trustRing as WywoTrustRing)
      : trustStatus
        ? ringForStatus(trustStatus)
        : undefined;
    const contact = await upsertContactTrust({
      ownerPhoneE164: actor.phoneE164,
      ownerUid: actor.uid ?? null,
      contactPhone,
      contactName: typeof body.contactName === "string" ? body.contactName : null,
      contactUid: typeof body.contactUid === "string" ? body.contactUid : null,
      trustStatus,
      trustRing,
      referralPhone: typeof body.referralPhone === "string" ? body.referralPhone : null,
      notes: typeof body.notes === "string" ? body.notes : null,
    });
    return { contact };
  });
}
