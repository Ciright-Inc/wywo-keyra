import { withWywoActor } from "@/lib/wywo/apiHelpers";
import { getWywoMessage } from "@/lib/wywo/messages";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withWywoActor(req, async (actor) => {
    const { id } = await ctx.params;
    const message = await getWywoMessage(actor, id);
    if (!message) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return { message };
  });
}
