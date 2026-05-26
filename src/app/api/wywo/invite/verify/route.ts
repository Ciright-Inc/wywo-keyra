import { NextResponse } from "next/server";
import { resolveWywoActorFromRequest } from "@/lib/wywo/auth";
import { recordWywoAudit } from "@/lib/wywo/audit";
import {
  findInviteByToken,
  inviteIsExpired,
  markInviteVerified,
} from "@/lib/wywo/invites";
import { upsertContactTrust } from "@/lib/wywo/trust";
import { ensurePersonalWywoWorld } from "@/lib/wywo/worlds";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    token?: string;
    recipientName?: string;
  };
  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token." }, { status: 400 });
  }
  const actor = await resolveWywoActorFromRequest(req);
  if (!actor) {
    return NextResponse.json(
      { ok: false, error: "Sign in with Keyra first." },
      { status: 401 },
    );
  }
  const invite = await findInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ ok: false, error: "Invite not found." }, { status: 404 });
  }
  if (invite.recipientPhone !== actor.phoneE164) {
    return NextResponse.json(
      {
        ok: false,
        error: `This invite is for ${invite.recipientPhone}. Sign in with that number to verify.`,
      },
      { status: 403 },
    );
  }
  if (inviteIsExpired(invite)) {
    return NextResponse.json(
      { ok: false, error: "This invite has expired." },
      { status: 410 },
    );
  }

  await markInviteVerified(token);
  const world = await ensurePersonalWywoWorld({
    phoneE164: actor.phoneE164,
    displayName: body.recipientName || actor.displayName,
    email: actor.email,
    uid: actor.uid,
  });

  await prisma.keyraWywoMessage.update({
    where: { id: invite.messageId },
    data: {
      messageStatus: "DELIVERED",
      deliveredAt: new Date(),
      inviteStatus: "VERIFIED",
      recipientName: body.recipientName || actor.displayName || invite.message?.recipientName,
      toWorldId: world.worldId,
    },
  });

  if (invite.message) {
    await upsertContactTrust({
      ownerPhoneE164: actor.phoneE164,
      contactPhone: invite.message.senderPhone,
      contactName: invite.message.senderName,
      trustStatus: "PENDING_REVIEW",
      trustRing: "PENDING_UNKNOWNS",
    });
    await upsertContactTrust({
      ownerPhoneE164: invite.message.senderPhone,
      contactPhone: actor.phoneE164,
      contactName: body.recipientName || actor.displayName,
      trustStatus: "PENDING_REVIEW",
      trustRing: "PENDING_UNKNOWNS",
    });
  }

  await recordWywoAudit({
    messageId: invite.messageId,
    actorPhone: actor.phoneE164,
    actorUid: actor.uid ?? null,
    action: "invite.verified",
    newValue: { token, recipientName: body.recipientName ?? null },
  });

  return NextResponse.json({
    ok: true,
    messageId: invite.messageId,
    worldId: world.worldId,
  });
}
