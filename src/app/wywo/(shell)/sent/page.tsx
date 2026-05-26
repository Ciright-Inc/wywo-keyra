import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";

export default async function WywoSentPage() {
  const actor = await assertWywoActor("/wywo/sent");
  const { items } = await listWywoMessages(actor, { direction: "sent", perPage: 50 });
  return (
    <div>
      <AdminDirectoryPageHeader title="Sent" description="Messages you have sent across your Ciright worlds." />
      <div className="mt-6">
        <WywoMessageList items={items} emptyLabel="No sent messages yet." />
      </div>
    </div>
  );
}
