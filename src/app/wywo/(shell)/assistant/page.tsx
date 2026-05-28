import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoAssistantQueueClient } from "@/components/wywo/WywoAssistantQueueClient";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";

export const dynamic = "force-dynamic";

export default async function WywoAssistantQueuePage() {
  const actor = await assertWywoActor("/wywo/assistant");
  if (!actor.isAdmin) {
    redirect("/wywo/home");
  }

  const { items } = await listWywoMessages(actor, {
    direction: "inbox",
    pendingTrust: true,
    perPage: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <AdminDirectoryPageHeader
          title="Executive assistant mode"
          description="Process trusted-message queue. Approve senders into trust rings, or block entities. Every action is attributable."
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Link href="/wywo/pending" className="ds-text-link ds-body-sm">
          View pending trust queue (read-only)
        </Link>
      </div>

      <WywoAssistantQueueClient items={items} />
    </div>
  );
}

