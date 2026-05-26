import type { WywoTrustStatus } from "@prisma/client";
import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { approveSender } from "@/lib/wywo/messages";

export const dynamic = "force-dynamic";

const VALID: WywoTrustStatus[] = ["TRUSTED", "FAMILY_CIRCLE", "EXECUTIVE_RING", "REFERRED"];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withWywoActor(req, async (actor) => {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { ring?: string };
    const ring = (body.ring && VALID.includes(body.ring as WywoTrustStatus)
      ? (body.ring as WywoTrustStatus)
      : "TRUSTED") as WywoTrustStatus;
    const message = await approveSender(actor, id, ring);
    return { message };
  });
}
