import { WywoSlipLandingClient } from "@/components/wywo/WywoSlipLandingClient";
import { resolveKeyraSessionFromCookies } from "@/lib/keyraSessionServer";

export const dynamic = "force-dynamic";

/**
 * Public WYWO landing — digital slip. Stay on this page after Keyra login;
 * submit appears once session is established (shared keyra_session cookie).
 */
export default async function WywoSlipLandingPage() {
  const session = await resolveKeyraSessionFromCookies();
  const initialSignedIn = Boolean(session?.phoneE164);

  return (
    <section className="keyra-band--light wywo-slip-landing">
      <div className="wywo-slip-landing__section">
        <WywoSlipLandingClient initialSignedIn={initialSignedIn} />
      </div>
    </section>
  );
}
