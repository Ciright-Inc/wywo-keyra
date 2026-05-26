import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoOnboardingForm } from "@/components/wywo/WywoOnboardingForm";
import { assertWywoActor } from "@/lib/wywo/auth";
import { ensurePersonalWywoWorld } from "@/lib/wywo/worlds";

export default async function WywoOnboardingPage() {
  const actor = await assertWywoActor("/wywo/onboarding");
  const world = await ensurePersonalWywoWorld({
    phoneE164: actor.phoneE164,
    displayName: actor.displayName,
    email: actor.email,
    uid: actor.uid,
  });

  return (
    <div>
      <AdminDirectoryPageHeader
        title="Your WYWO world"
        description="Create and configure your personal Keyra world linked to Ciright subscription identity."
      />
      <div className="mt-6">
        <WywoOnboardingForm initial={world} />
      </div>
    </div>
  );
}
