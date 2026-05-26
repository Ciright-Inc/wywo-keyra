import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { replyToWywoMessage } from "@/lib/wywo/messages";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withWywoActor(req, async (actor) => {
    const { id } = await ctx.params;
    const body = (await req.json()) as { body?: string };
    if (!body.body?.trim()) throw new Error("Reply body is required.");
    const result = await replyToWywoMessage(actor, id, body.body);
    return result;
  });
}
