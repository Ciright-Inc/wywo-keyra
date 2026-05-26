import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";

export default async function WywoPendingPage() {
  const actor = await assertWywoActor("/wywo/pending");
  const { items } = await listWywoMessages(actor, {
    direction: "inbox",
    pendingTrust: true,
    perPage: 50,
  });
  return (
    <div>
      <AdminDirectoryPageHeader
        title="Pending trust"
        description="Messages requiring approval, referral evaluation, or identity verification."
      />
      <div className="mt-6">
        <WywoMessageList items={items} emptyLabel="No messages pending trust review." />
      </div>
    </div>
  );
}
