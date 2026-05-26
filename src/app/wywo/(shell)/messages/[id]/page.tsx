import { notFound } from "next/navigation";
import { WywoMessageDetailClient } from "@/components/wywo/WywoMessageDetailClient";
import { assertWywoActor } from "@/lib/wywo/auth";
import { getWywoMessage } from "@/lib/wywo/messages";

type Params = { params: Promise<{ id: string }> };

export default async function WywoMessageDetailPage({ params }: Params) {
  const actor = await assertWywoActor("/wywo/inbox");
  const { id } = await params;
  const message = await getWywoMessage(actor, id);
  if (!message) notFound();
  return <WywoMessageDetailClient message={message} />;
}
