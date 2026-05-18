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
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const meetingIntent =
    typeof b.meetingIntent === "string" ? b.meetingIntent.trim() : "";
  const eventSlug = typeof b.eventSlug === "string" ? b.eventSlug.trim() : "";

  if (!name || !email || !meetingIntent) {
    return NextResponse.json({ error: "name, email, and meetingIntent required" }, { status: 400 });
  }

  let eventId: string | undefined;
  if (eventSlug) {
    const ev = await prisma.event.findFirst({
      where: { slug: eventSlug, approvedPublic: true },
      select: { id: true },
    });
    eventId = ev?.id;
  }

  await prisma.meetingRequest.create({
    data: {
      name,
      email,
      organization: typeof b.organization === "string" ? b.organization : undefined,
      role: typeof b.role === "string" ? b.role : undefined,
      meetingIntent,
      notes: typeof b.notes === "string" ? b.notes : undefined,
      eventId,
    },
  });

  return NextResponse.json({ ok: true });
}
