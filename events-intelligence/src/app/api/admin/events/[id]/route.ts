import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toPublicEventJson } from "@/lib/event-json";
import { isAdmin } from "@/lib/admin-auth";
import {
  parseAdminEventScalars,
  parseIndustries,
  parseSatCoreProblems,
  scoreFromScalars,
  uniqueSlug,
} from "@/lib/event-parse";

type Params = { id: string };

async function requireAdmin() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { industries: true, satCoreProblems: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ event: toPublicEventJson(event) });
}

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const existing = await prisma.event.findUnique({
    where: { id },
    include: { industries: true, satCoreProblems: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const scalars = parseAdminEventScalars(b);

  let slug = existing.slug;
  if (typeof scalars.slug === "string" && scalars.slug && scalars.slug !== existing.slug) {
    slug = await prisma.$transaction(async (tx) => uniqueSlug(tx, scalars.slug!, id));
  } else if (scalars.name && scalars.name !== existing.name && b.regenerateSlug === true) {
    slug = await prisma.$transaction(async (tx) => uniqueSlug(tx, scalars.name!, id));
  }

  const merged = {
    ...existing,
    ...scalars,
    slug,
    industries: undefined,
    satCoreProblems: undefined,
    id: existing.id,
    createdAt: existing.createdAt,
    lastUpdated: existing.lastUpdated,
  };

  const keyraPriorityScore = scoreFromScalars(merged as Prisma.EventUncheckedCreateInput);

  const industries =
    b.industries !== undefined ? parseIndustries(b.industries) : undefined;
  const satCoreProblems =
    b.satCoreProblems !== undefined ? parseSatCoreProblems(b.satCoreProblems) : undefined;

  const updated = await prisma.$transaction(async (tx) => {
    if (industries) {
      await tx.eventIndustry.deleteMany({ where: { eventId: id } });
    }
    if (satCoreProblems) {
      await tx.eventSatCoreProblem.deleteMany({ where: { eventId: id } });
    }

    return tx.event.update({
      where: { id },
      data: {
        ...(scalars as Prisma.EventUpdateInput),
        slug,
        keyraPriorityScore,
        ...(industries
          ? {
              industries: {
                create: industries.map((industry) => ({ industry })),
              },
            }
          : {}),
        ...(satCoreProblems
          ? {
              satCoreProblems: {
                create: satCoreProblems.map((problem) => ({ problem })),
              },
            }
          : {}),
      },
      include: { industries: true, satCoreProblems: true },
    });
  });

  return NextResponse.json({ event: toPublicEventJson(updated) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;

  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
