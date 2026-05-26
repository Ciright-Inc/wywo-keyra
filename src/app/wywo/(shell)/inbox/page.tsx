import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";

export default async function WywoInboxPage() {
  const actor = await assertWywoActor("/wywo/inbox");
  const { items } = await listWywoMessages(actor, { direction: "inbox", perPage: 50 });
  return (
    <div>
      <AdminDirectoryPageHeader
        title="Inbox"
        description="Trusted, referred, and world-scoped messages awaiting your review."
      />
      <div className="mt-6">
        <WywoMessageList items={items} />
      </div>
    </div>
  );
}
