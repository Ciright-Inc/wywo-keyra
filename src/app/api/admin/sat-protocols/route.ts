import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireGlobalFeedWrite } from "@/lib/authenticationFeed/adminGuard";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function validateHomeRoaming(home: number, roam: number): string | null {
  const t = home + roam;
  if (Math.abs(t - 100) > 0.1) {
    return "Home percentage + roaming percentage must equal 100.";
  }
  return null;
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const activeParam = url.searchParams.get("active");
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const where = {
    ...(activeParam === "true" ? { active: true } : {}),
    ...(activeParam === "false" ? { active: false } : {}),
    ...(q
      ? {
          OR: [
            { protocolName: { contains: q, mode: "insensitive" as const } },
            { protocolCode: { contains: q, mode: "insensitive" as const } },
            { protocolCategory: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const rows = await prisma.satProtocol.findMany({
    where,
    orderBy: { protocolName: "asc" },
  });

  return NextResponse.json({ protocols: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalFeedWrite(auth);
  if (denied) return denied;

  const limited = rateLimitResponse(req, "admin-sat-protocols-post");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const protocolName = typeof body.protocolName === "string" ? body.protocolName.trim() : "";
  const protocolCode = typeof body.protocolCode === "string" ? body.protocolCode.trim().toUpperCase() : "";
  const protocolCategory = typeof body.protocolCategory === "string" ? body.protocolCategory.trim() : "";
  const active = body.active === false ? false : true;
  const percentageWeight =
    typeof body.percentageWeight === "number" && Number.isFinite(body.percentageWeight)
      ? body.percentageWeight
      : 1;
  const protocolMemo = typeof body.protocolMemo === "string" ? body.protocolMemo : "";
  const protocolUrlEnabled = body.protocolUrlEnabled === true;
  const protocolUrl = typeof body.protocolUrl === "string" ? body.protocolUrl.trim() : null;
  const allowProtocolLink = body.allowProtocolLink === true;
  const homePercentage =
    typeof body.homePercentage === "number" && Number.isFinite(body.homePercentage)
      ? body.homePercentage
      : 50;
  const roamingPercentage =
    typeof body.roamingPercentage === "number" && Number.isFinite(body.roamingPercentage)
      ? body.roamingPercentage
      : 50;

  if (!protocolName || !protocolCode || !protocolCategory) {
    return NextResponse.json({ error: "protocolName, protocolCode, and protocolCategory are required." }, { status: 400 });
  }

  const hrErr = validateHomeRoaming(homePercentage, roamingPercentage);
  if (hrErr) return NextResponse.json({ error: hrErr }, { status: 400 });

  const dup = await prisma.satProtocol.findUnique({ where: { protocolCode } });
  if (dup) {
    return NextResponse.json({ error: "Protocol code already exists." }, { status: 409 });
  }

  const created = await prisma.satProtocol.create({
    data: {
      protocolName,
      protocolCode,
      protocolCategory,
      active,
      percentageWeight,
      protocolMemo,
      protocolUrlEnabled,
      protocolUrl: protocolUrl?.length ? protocolUrl : null,
      allowProtocolLink,
      homePercentage,
      roamingPercentage,
    },
  });

  await writeAudit({
    entityType: "SatProtocol",
    entityId: created.id,
    action: "create",
    payload: { snapshot: created },
  });

  return NextResponse.json({ protocol: created });
}
