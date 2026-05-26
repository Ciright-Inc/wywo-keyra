import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { listInvitesForSender } from "@/lib/wywo/invites";

export const dynamic = "force-dynamic";

/**
 * Sender-side: list invites you have issued.
 * Creation happens implicitly via POST /api/wywo/messages → createWywoInvite.
 */
export async function GET(req: Request) {
  return withWywoActor(req, async (actor) => {
    const invites = await listInvitesForSender(actor.phoneE164);
    return { invites };
  });
}
