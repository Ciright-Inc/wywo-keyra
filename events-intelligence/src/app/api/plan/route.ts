import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const visitorKey = typeof b.visitorKey === "string" ? b.visitorKey.trim() : "";
  const eventId = typeof b.eventId === "string" ? b.eventId.trim() : "";

  if (!visitorKey || visitorKey.length < 8 || !eventId) {
    return NextResponse.json({ error: "visitorKey and eventId required" }, { status: 400 });
  }

  await prisma.globalEventPlanItem.upsert({
    where: {
      visitorKey_eventId: { visitorKey, eventId },
    },
    create: { visitorKey, eventId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const visitorKey = searchParams.get("visitorKey")?.trim() ?? "";
  if (!visitorKey || visitorKey.length < 8) {
    return NextResponse.json({ error: "visitorKey required" }, { status: 400 });
  }

  const items = await prisma.globalEventPlanItem.findMany({
    where: { visitorKey },
    include: {
      event: {
        include: { industries: true, satCoreProblems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: items
      .filter((i) => i.event.approvedPublic)
      .map((i) => ({ id: i.id, event: toPublicEventJson(i.event) })),
  });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  const visitorKey = searchParams.get("visitorKey")?.trim() ?? "";
  if (!id || !visitorKey) {
    return NextResponse.json({ error: "id and visitorKey required" }, { status: 400 });
  }

  await prisma.globalEventPlanItem.deleteMany({
    where: { id, visitorKey },
  });

  return NextResponse.json({ ok: true });
}
