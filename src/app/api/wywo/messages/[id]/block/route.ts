import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { blockSender } from "@/lib/wywo/messages";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withWywoActor(req, async (actor) => {
    const { id } = await ctx.params;
    const message = await blockSender(actor, id);
    return { message };
  });
}
