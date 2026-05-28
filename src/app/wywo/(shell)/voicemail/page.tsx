import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";

export default async function WywoVoicemailPage() {
  const actor = await assertWywoActor("/wywo/voicemail");
  const { items } = await listWywoMessages(actor, {
    direction: "inbox",
    sourceType: "VOICEMAIL",
    perPage: 50,
  });

  return (
    <div>
      <AdminDirectoryPageHeader
        title="Voicemail"
        description="Encrypted voicemail, normalized into the WYWO trusted inbox."
      />
      <div className="mt-6">
        <WywoMessageList items={items} emptyLabel="No voicemails yet." />
      </div>
    </div>
  );
}

