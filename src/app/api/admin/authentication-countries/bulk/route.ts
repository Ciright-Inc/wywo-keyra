import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function patchFromUpdate(u: Record<string, unknown>): { data: Record<string, unknown> } | { error: string } {
  const data: Record<string, unknown> = {};
  if (typeof u.countryName === "string") data.countryName = u.countryName.trim();
  if (typeof u.iso2 === "string") {
    const iso2 = u.iso2.trim().toUpperCase();
    if (iso2.length !== 2) return { error: "iso2 must be two letters." };
    data.iso2 = iso2;
  }
  if (typeof u.region === "string") data.region = u.region.trim();
  if (typeof u.active === "boolean") data.active = u.active;
  if (typeof u.percentageWeight === "number" && Number.isFinite(u.percentageWeight)) {
    data.percentageWeight = u.percentageWeight;
  }
  if (typeof u.displayPriority === "number" && Number.isFinite(u.displayPriority)) {
    data.displayPriority = Math.floor(u.displayPriority);
  }
  if ("notes" in u) {
    if (typeof u.notes === "string") data.notes = u.notes.trim() || null;
    else if (u.notes === null) data.notes = null;
  }
  if (Object.keys(data).length === 0) return { error: "Each update must include at least one field besides id." };
  return { data };
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-auth-countries-bulk");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const raw = body.updates;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "updates must be a non-empty array." }, { status: 400 });
  }
  if (raw.length > 500) {
    return NextResponse.json({ error: "Too many rows in one bulk request (max 500)." }, { status: 400 });
  }

  const updates: Record<string, unknown>[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) continue;
    updates.push({ ...o, id });
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid update objects." }, { status: 400 });
  }

  const ids: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      for (const u of updates) {
        const id = u.id as string;
        const built = patchFromUpdate(u);
        if ("error" in built) {
          throw new Error(`BAD_INPUT:${built.error}`);
        }
        const existing = await tx.authenticationCountry.findUnique({ where: { id } });
        if (!existing) {
          throw new Error("NOT_FOUND");
        }
        if (typeof built.data.iso2 === "string" && built.data.iso2 !== existing.iso2) {
          const clash = await tx.authenticationCountry.findUnique({ where: { iso2: built.data.iso2 as string } });
          if (clash) throw new Error("ISO2_CONFLICT");
        }
        await tx.authenticationCountry.update({
          where: { id },
          data: built.data as never,
        });
        ids.push(id);
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("BAD_INPUT:")) {
      return NextResponse.json({ error: msg.replace("BAD_INPUT:", "") }, { status: 400 });
    }
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "One or more country ids were not found." }, { status: 404 });
    }
    if (msg === "ISO2_CONFLICT") {
      return NextResponse.json({ error: "Duplicate ISO2 in bulk update." }, { status: 409 });
    }
    throw e;
  }

  await writeAudit({
    entityType: "AuthenticationCountry",
    entityId: "bulk",
    action: "bulk_update",
    payload: { count: ids.length, ids },
  });

  return NextResponse.json({ updated: ids.length });
}
