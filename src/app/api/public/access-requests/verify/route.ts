import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { RequestVerificationStatus } from "@prisma/client";
import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "public-access-requests-verify");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!requestId || !token) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const hash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.serverAccessRequest.findUnique({ where: { id: requestId } });
  if (!row?.verificationTokenHash || !row.verificationExpiresAt) {
    return NextResponse.json({ error: "Unable to verify." }, { status: 400 });
  }

  if (row.verificationExpiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This verification link has expired." }, { status: 400 });
  }

  if (row.verificationTokenHash !== hash) {
    return NextResponse.json({ error: "Unable to verify." }, { status: 400 });
  }

  if (row.verificationStatus === RequestVerificationStatus.VERIFIED) {
    return NextResponse.json({ ok: true, message: "Already verified." });
  }

  await prisma.$transaction([
    prisma.serverAccessRequest.update({
      where: { id: requestId },
      data: { verificationStatus: RequestVerificationStatus.VERIFIED },
    }),
    prisma.auditEvent.create({
      data: {
        actorId: null,
        actorRole: "PUBLIC",
        entityType: "ServerAccessRequest",
        entityId: requestId,
        action: "VERIFY_EMAIL",
        payloadJson: {},
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    message: "Verified. Your request is now awaiting operator approval.",
  });
}
