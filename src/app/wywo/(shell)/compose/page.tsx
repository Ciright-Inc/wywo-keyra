import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoComposeForm } from "@/components/wywo/WywoComposeForm";

export default function WywoComposePage() {
  return (
    <div>
      <AdminDirectoryPageHeader
        title="Compose WYWO"
        description="Send a verified message with trust evaluation, referral routing, and secure onboarding."
      />
      <div className="mt-6">
        <WywoComposeForm />
      </div>
    </div>
  );
}
