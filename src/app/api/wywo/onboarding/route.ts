import { withWywoActor } from "@/lib/wywo/apiHelpers";
import {
  ensurePersonalWywoWorld,
  updatePersonalWywoWorld,
} from "@/lib/wywo/worlds";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withWywoActor(req, async (actor) => {
    const world = await ensurePersonalWywoWorld({
      phoneE164: actor.phoneE164,
      displayName: actor.displayName,
      email: actor.email,
      uid: actor.uid,
    });
    return { world };
  });
}

export async function POST(req: Request) {
  return withWywoActor(req, async (actor) => {
    const body = (await req.json()) as Record<string, unknown>;
    await ensurePersonalWywoWorld({
      phoneE164: actor.phoneE164,
      displayName: actor.displayName,
      email: actor.email,
      uid: actor.uid,
    });
    const world = await updatePersonalWywoWorld({
      phoneE164: actor.phoneE164,
      name: typeof body.name === "string" ? body.name : undefined,
      company: typeof body.company === "string" ? body.company : null,
      role: typeof body.role === "string" ? body.role : null,
      country: typeof body.country === "string" ? body.country : null,
      preferredDevice: typeof body.preferredDevice === "string"
        ? body.preferredDevice
        : null,
      notificationRules:
        body.notificationRules && typeof body.notificationRules === "object"
          ? (body.notificationRules as Record<string, unknown>)
          : null,
      subscriptionId:
        body.subscriptionId === null
          ? null
          : typeof body.subscriptionId === "string"
            ? body.subscriptionId
            : undefined,
      eid: body.eid === null ? null : typeof body.eid === "string" ? body.eid : undefined,
      uid: body.uid === null ? null : typeof body.uid === "string" ? body.uid : undefined,
    });
    return { world };
  });
}
