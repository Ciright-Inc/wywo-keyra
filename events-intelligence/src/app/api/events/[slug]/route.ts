import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";
import { isAdmin } from "@/lib/admin-auth";

type Params = { slug: string };

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { slug } = await ctx.params;
  const admin = await isAdmin();

  const event = await prisma.event.findFirst({
    where: {
      slug,
      ...(admin ? {} : { approvedPublic: true }),
    },
    include: { industries: true, satCoreProblems: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ event: toPublicEventJson(event) });
}
