/**
 * End-to-end recipient-side WYWO flow test.
 *
 * Drives every action that requires the recipient's perspective — invite
 * verification, message read tracking, approve/block transitions, reply,
 * archive on the inbox side — by calling lib/wywo directly with crafted
 * WywoActor objects. The HTTP smoke test (scripts/wywo-smoke.sh) already
 * covers the sender-side surface.
 *
 * Run with: npx tsx scripts/wywo-flow-check.ts
 */

import "dotenv/config";

import { prisma } from "@/lib/prisma";
import { ensurePersonalWywoWorld } from "@/lib/wywo/worlds";
import {
  approveSender,
  archiveMessage,
  blockSender,
  createWywoMessage,
  getWywoMessage,
  listWywoMessages,
  replyToWywoMessage,
} from "@/lib/wywo/messages";
import {
  findInviteByToken,
  inviteIsExpired,
  markInviteVerified,
} from "@/lib/wywo/invites";
import { listTrustContacts, upsertContactTrust } from "@/lib/wywo/trust";
import type { WywoActor } from "@/lib/wywo/types";

const SENDER_PHONE = process.env.KEYRA_DEV_SESSION_PHONE?.trim() ?? "+919854223823";
const RECIPIENT_PHONE = "+919054223823";

const sender: WywoActor = {
  phoneE164: SENDER_PHONE,
  displayName: "Devisha jansari (sender)",
};
const recipient: WywoActor = {
  phoneE164: RECIPIENT_PHONE,
  displayName: "Recipient Test",
};

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    failures.push(label + (detail ? ` :: ${JSON.stringify(detail)}` : ""));
    console.log(`  ✗ ${label}`, detail ?? "");
  }
}

function section(title: string) {
  console.log(`\n──── ${title}`);
}

async function cleanup() {
  // Remove any prior test messages between the sender and recipient so the run
  // is repeatable.
  await prisma.keyraWywoInvite.deleteMany({
    where: { recipientPhone: RECIPIENT_PHONE },
  });
  await prisma.keyraWywoMessage.deleteMany({
    where: {
      OR: [
        { senderPhone: SENDER_PHONE, recipientPhone: RECIPIENT_PHONE },
        { senderPhone: RECIPIENT_PHONE, recipientPhone: SENDER_PHONE },
      ],
    },
  });
  await prisma.keyraWywoContactTrust.deleteMany({
    where: {
      OR: [
        { ownerPhoneE164: SENDER_PHONE, contactPhone: RECIPIENT_PHONE },
        { ownerPhoneE164: RECIPIENT_PHONE, contactPhone: SENDER_PHONE },
      ],
    },
  });
  await prisma.keyraWywoWorld.deleteMany({
    where: { ownerPhoneE164: RECIPIENT_PHONE },
  });
}

async function main() {
  await cleanup();
  await ensurePersonalWywoWorld({
    phoneE164: sender.phoneE164,
    displayName: sender.displayName,
  });

  section("1. Sender sends an WYWO to an unknown recipient → invite issued");
  const first = await createWywoMessage(sender, {
    recipientPhone: RECIPIENT_PHONE,
    recipientName: "Recipient Test",
    subject: "Flow check #1 — invite path",
    body: "First message to a brand-new recipient. Expect invite issued.",
    priority: "normal",
    category: "general",
  });
  check("invite issued for new recipient", first.inviteIssued === true, {
    inviteIssued: first.inviteIssued,
    recipientOnKeyra: first.recipientOnKeyra,
  });
  check("invite token present", typeof first.message.inviteToken === "string" && !!first.message.inviteToken);
  check("message body returned encrypted to caller", typeof first.message.body === "string");

  section("2. Recipient verifies invite → world created, trust pending");
  const inviteToken = first.message.inviteToken!;
  const invite = await findInviteByToken(inviteToken);
  check("invite found by token", !!invite);
  check("invite not expired", !!invite && !inviteIsExpired(invite));
  check("invite recipient matches", invite?.recipientPhone === RECIPIENT_PHONE);

  await markInviteVerified(inviteToken);
  const recipientWorld = await ensurePersonalWywoWorld({
    phoneE164: recipient.phoneE164,
    displayName: recipient.displayName,
  });
  check("recipient personal world created", !!recipientWorld.worldId);

  // Mimic the verify route trust seeding
  await upsertContactTrust({
    ownerPhoneE164: recipient.phoneE164,
    contactPhone: sender.phoneE164,
    contactName: sender.displayName,
    trustStatus: "PENDING_REVIEW",
    trustRing: "PENDING_UNKNOWNS",
  });
  await upsertContactTrust({
    ownerPhoneE164: sender.phoneE164,
    contactPhone: recipient.phoneE164,
    contactName: recipient.displayName,
    trustStatus: "PENDING_REVIEW",
    trustRing: "PENDING_UNKNOWNS",
  });

  // Promote message to DELIVERED so recipient can see it
  await prisma.keyraWywoMessage.update({
    where: { id: first.message.id },
    data: {
      messageStatus: "DELIVERED",
      deliveredAt: new Date(),
      inviteStatus: "VERIFIED",
      toWorldId: recipientWorld.worldId,
    },
  });

  section("3. Recipient inbox shows the message");
  const inboxAll = await listWywoMessages(recipient, { direction: "inbox", pendingTrust: true });
  check("inbox (pending) shows verified message", inboxAll.total >= 1);
  const inboxMsg = inboxAll.items.find((m) => m.id === first.message.id);
  check("inbox contains the test message", !!inboxMsg);

  section("4. Recipient opens message → marks READ");
  const opened = await getWywoMessage(recipient, first.message.id);
  check("message fetched", !!opened);
  check("body decrypted", opened?.body.startsWith("First message"));
  check("messageStatus = READ", opened?.messageStatus === "READ");
  check("readAt populated", !!opened?.readAt);

  section("5. Recipient approves the sender → contact becomes TRUSTED");
  const approved = await approveSender(recipient, first.message.id, "TRUSTED");
  check("approveSender returns TRUSTED", approved.trustStatus === "TRUSTED");
  check("approvedAt populated", !!approved.approvedAt);
  const contactsAfterApprove = await listTrustContacts(recipient.phoneE164);
  const senderContact = contactsAfterApprove.find((c) => c.contactPhone === sender.phoneE164);
  check("contact trust ring is TRUSTED_CONTACTS",
    senderContact?.trustRing === "TRUSTED_CONTACTS",
    { contact: senderContact });

  section("6. Recipient sends a reply → lands in original sender's pending queue");
  const reply = await replyToWywoMessage(recipient, first.message.id, "Reply from recipient.");
  check("reply created", !!reply.message?.id);
  check("reply direction = sent (for recipient)", reply.message?.direction === "sent");
  // The original sender hasn't approved the recipient yet, so by doctrine the
  // reply goes into the sender's PENDING_REVIEW queue rather than the trusted
  // inbox. The compose form / inbox page surface this via the "pending" tab.
  const senderPending = await listWywoMessages(sender, { direction: "inbox", pendingTrust: true });
  const replyInSenderInbox = senderPending.items.find((m) => m.id === reply.message!.id);
  check("reply visible in original sender's pending queue", !!replyInSenderInbox);

  section("7. Original message marked REPLIED on the original sender's side");
  const originalAfterReply = await prisma.keyraWywoMessage.findUnique({ where: { id: first.message.id } });
  check("original message status = REPLIED", originalAfterReply?.messageStatus === "REPLIED");

  section("8. Second message → recipient blocks sender → trust becomes BLOCKED");
  // Trust between them is now TRUSTED — so this message is not invite-gated.
  const second = await createWywoMessage(sender, {
    recipientPhone: RECIPIENT_PHONE,
    subject: "Flow check #2 — block path",
    body: "Spammy second message.",
    priority: "high",
  });
  check("second message delivered (no invite needed for trusted contact)",
    second.inviteIssued === false && second.message.messageStatus === "DELIVERED");

  const blocked = await blockSender(recipient, second.message.id);
  check("blockSender → BLOCKED", blocked.trustStatus === "BLOCKED");
  check("blockedAt populated", !!blocked.blockedAt);
  const contactsAfterBlock = await listTrustContacts(recipient.phoneE164);
  const senderAfterBlock = contactsAfterBlock.find((c) => c.contactPhone === sender.phoneE164);
  check("contact ring becomes BLOCKED_ENTITIES",
    senderAfterBlock?.trustRing === "BLOCKED_ENTITIES");

  section("9. After block, sender cannot deliver further messages (doctrine: hard block)");
  let blockedThrew = false;
  let blockedError = "";
  try {
    await createWywoMessage(sender, {
      recipientPhone: RECIPIENT_PHONE,
      subject: "Flow check #3 — after block",
      body: "This one must be rejected at the boundary.",
    });
  } catch (err) {
    blockedThrew = true;
    blockedError = (err as Error).message;
  }
  check("sender rejected at boundary after block",
    blockedThrew && /blocked your number/i.test(blockedError),
    { blockedError });

  section("10. Archive message (sender side, original first message)");
  const archived = await archiveMessage(sender, first.message.id);
  check("archived archivedAt populated", !!archived.archivedAt);
  check("archived messageStatus = ARCHIVED", archived.messageStatus === "ARCHIVED");

  section("Summary");
  console.log(`PASS: ${pass}   FAIL: ${fail}`);
  // Clean up so subsequent dev sessions are pristine.
  await cleanup();
  if (fail > 0) {
    console.log("\nFailures:");
    for (const f of failures) console.log("  -", f);
    process.exit(1);
  }
  process.exit(0);
}

main()
  .catch((err) => {
    console.error("\nFATAL", err);
    process.exit(2);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
