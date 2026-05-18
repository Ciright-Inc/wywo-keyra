import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const submitterEmail =
    typeof b.submitterEmail === "string" ? b.submitterEmail.trim() : "";
  const updateSummary =
    typeof b.updateSummary === "string" ? b.updateSummary.trim() : "";
  const eventSlug = typeof b.eventSlug === "string" ? b.eventSlug.trim() : "";

  if (!submitterEmail || !updateSummary) {
    return NextResponse.json(
      { error: "submitterEmail and updateSummary required" },
      { status: 400 },
    );
  }

  let eventId: string | undefined;
  if (eventSlug) {
    const ev = await prisma.event.findFirst({
      where: { slug: eventSlug, approvedPublic: true },
      select: { id: true },
    });
    eventId = ev?.id;
  }

  await prisma.eventUpdateSubmission.create({
    data: {
      submitterEmail,
      updateSummary,
      sourceUrl: typeof b.sourceUrl === "string" ? b.sourceUrl : undefined,
      eventId,
    },
  });

  return NextResponse.json({ ok: true });
}
