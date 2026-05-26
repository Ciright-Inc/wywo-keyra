import "@/styles/wywo-shell.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveWywoActor } from "@/lib/wywo/auth";
import { findInviteByToken, inviteIsExpired, markInviteClicked } from "@/lib/wywo/invites";
import { WYWO_INVITE_TTL_MS } from "@/lib/wywo/constants";
import { WywoInviteVerifyClient } from "@/components/wywo/WywoInviteVerifyClient";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export default async function WywoInvitePage({ params }: Params) {
  const { token } = await params;
  const invite = await findInviteByToken(token);
  if (!invite) notFound();
  await markInviteClicked(token).catch(() => undefined);

  const actor = await resolveWywoActor();
  const expired = inviteIsExpired(invite);
  const expiresAt = new Date(invite.createdAt.getTime() + WYWO_INVITE_TTL_MS);
  const senderName = invite.message?.senderName ?? "A verified Keyra user";

  return (
    <div className="wywo-invite-shell">
      <div className="wywo-invite-card space-y-6">
        <header className="space-y-2">
          <p className="ds-caption-uppercase">While You Were Out</p>
          <h1 className="ds-display-sm">A trusted message is waiting</h1>
          <p className="ds-body-sm">
            {senderName} sent you a verified WYWO message on Keyra. Verify your identity to receive
            and reply.
          </p>
        </header>

        <div className="wywo-meta-grid">
          <div>
            <span>From</span>
            <p>{senderName}</p>
            <p className="ds-numeric ds-caption">{invite.senderPhoneE164}</p>
          </div>
          <div>
            <span>For</span>
            <p>{invite.recipientName ?? "Verified recipient"}</p>
            <p className="ds-numeric ds-caption">{invite.recipientPhone}</p>
          </div>
          <div>
            <span>Message id</span>
            <p className="ds-numeric break-all">
              {invite.message?.wywoMessageId ?? invite.messageId}
            </p>
          </div>
          <div>
            <span>Token expires</span>
            <p>{expiresAt.toUTCString()}</p>
          </div>
        </div>

        {expired ? (
          <div className="ds-feature-card is-dashboard">
            <p className="ds-body-sm">This invite has expired. Please ask the sender to resend.</p>
          </div>
        ) : actor && actor.phoneE164 === invite.recipientPhone ? (
          <WywoInviteVerifyClient token={token} alreadySignedIn />
        ) : actor ? (
          <div className="ds-feature-card is-dashboard space-y-2">
            <p className="ds-body-sm text-[var(--ds-ink)]">
              You are signed in as <strong className="ds-numeric">{actor.phoneE164}</strong>, but
              this invite is for{" "}
              <strong className="ds-numeric">{invite.recipientPhone}</strong>.
            </p>
            <p className="ds-caption">
              Sign in with the recipient phone to receive this message.
            </p>
            <Link href={`/login?returnTo=/wywo/invite/${token}`} className="ds-btn-secondary is-sm">
              Switch identity
            </Link>
          </div>
        ) : (
          <WywoInviteVerifyClient token={token} />
        )}
      </div>
    </div>
  );
}
