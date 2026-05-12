import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  EmployeeType,
  RequestApprovalStatus,
  RequestVerificationStatus,
  TargetType,
} from "@prisma/client";
import { readJsonObject, rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import {
  emailDomainFromAddress,
  matchAccessDomainRule,
} from "@/lib/deployments/accessRequest";
import prisma from "@/lib/prisma";
import { isMandrillConfigured, sendMandrillTransactional } from "@/services/mandrillClient";

const NEUTRAL_MESSAGE =
  "If your organization is eligible, you will receive a verification message shortly.";

function siteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://keyra.ie";
  return raw.replace(/\/$/, "");
}

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "public-access-requests");
  if (limited) return limited;

  const body = await readJsonObject(req);
  const targetTypeRaw = body.targetType;
  const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
  const workEmail = typeof body.workEmail === "string" ? body.workEmail.trim() : "";
  const employeeTypeRaw = body.employeeType;
  const requestReason =
    typeof body.requestReason === "string" ? body.requestReason.trim() : null;

  if (targetTypeRaw !== "COUNTRY" && targetTypeRaw !== "TELCO") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!targetId || !workEmail) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const emailDomain = emailDomainFromAddress(workEmail);
  if (!emailDomain) {
    return NextResponse.json({ error: "Enter a valid work email address." }, { status: 400 });
  }

  const employeeType =
    employeeTypeRaw === "TYPE_1" ? EmployeeType.TYPE_1 : EmployeeType.TYPE_1;

  const targetType = targetTypeRaw as TargetType;

  const target =
    targetType === TargetType.COUNTRY
      ? await prisma.countryDeployment.findFirst({
          where: { id: targetId, isPublished: true },
        })
      : await prisma.telcoDeployment.findFirst({
          where: { id: targetId, isPublished: true, country: { isPublished: true } },
        });

  if (!target) {
    return NextResponse.json({ message: NEUTRAL_MESSAGE }, { status: 202 });
  }

  const rules = await prisma.accessDomainRule.findMany({
    where: { targetType, targetId, isActive: true },
  });

  const match = matchAccessDomainRule(emailDomain, rules);
  if (!match.matched) {
    return NextResponse.json({ message: NEUTRAL_MESSAGE }, { status: 202 });
  }

  const token = randomBytes(24).toString("hex");
  const verificationTokenHash = createHash("sha256").update(token).digest("hex");
  const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const created = await prisma.serverAccessRequest.create({
    data: {
      targetType,
      targetId,
      workEmail: workEmail.toLowerCase(),
      employeeType,
      requestReason: requestReason?.length ? requestReason : null,
      verificationStatus: RequestVerificationStatus.PENDING,
      verificationTokenHash,
      verificationExpiresAt,
      approvalStatus: RequestApprovalStatus.PENDING,
    },
  });

  await prisma.auditEvent.create({
    data: {
      actorId: null,
      actorRole: "PUBLIC",
      entityType: "ServerAccessRequest",
      entityId: created.id,
      action: "CREATE",
      payloadJson: { targetType, targetId },
    },
  });

  const verifyUrl = `${siteOrigin()}/global-deployment?rid=${encodeURIComponent(
    created.id,
  )}&code=${encodeURIComponent(token)}`;

  const subject = "Keyra — verify your server access request";
  const text = [
    "Hello,",
    "",
    "We received a Keyra server access request for this email address.",
    "",
    `Verify your request (this link expires in 24 hours):`,
    verifyUrl,
    "",
    "If you did not request access, you can ignore this message.",
    "",
    "— Keyra",
  ].join("\n");

  const canEmail = isMandrillConfigured();
  if (!canEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[access-requests] Mandrill not configured. Dev verification link:", verifyUrl);
    } else {
      await prisma.serverAccessRequest.delete({ where: { id: created.id } });
      return NextResponse.json(
        { error: "Email delivery is not available right now. Please try again later." },
        { status: 503 },
      );
    }
  } else {
    const sent = await sendMandrillTransactional({
      to: workEmail,
      subject,
      text,
    });
    if (!sent.ok) {
      await prisma.serverAccessRequest.delete({ where: { id: created.id } });
      return NextResponse.json(
        { error: "We could not send the verification email. Please try again later." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({ message: NEUTRAL_MESSAGE }, { status: 202 });
}
