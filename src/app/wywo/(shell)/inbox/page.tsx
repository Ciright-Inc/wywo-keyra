import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { WywoUnifiedInboxFilters } from "@/components/wywo/WywoUnifiedInboxFilters";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoWorldsForOwner } from "@/lib/wywo/worlds";
import { listWywoMessages } from "@/lib/wywo/messages";
import {
  WYWO_SOURCE_TYPE_LABELS,
  WYWO_TRUST_RING_LABELS,
  WYWO_SOURCE_TYPE_OPTIONS,
} from "@/lib/wywo/constants";
import type { WywoSourceType, WywoTrustRing } from "@prisma/client";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function WywoInboxPage({ searchParams }: Props) {
  const actor = await assertWywoActor("/wywo/inbox");

  const sp = await searchParams;

  const q = typeof sp.q === "string" && sp.q ? sp.q : undefined;

  const trustRingRaw = typeof sp.trustRing === "string" ? sp.trustRing : "";
  const trustRing: WywoTrustRing | undefined =
    trustRingRaw && trustRingRaw in WYWO_TRUST_RING_LABELS
      ? (trustRingRaw as WywoTrustRing)
      : undefined;

  const worldId = typeof sp.worldId === "string" && sp.worldId ? sp.worldId : undefined;

  const sourceTypeRaw = typeof sp.sourceType === "string" ? sp.sourceType : "";
  const sourceType: WywoSourceType | undefined =
    sourceTypeRaw && sourceTypeRaw in WYWO_SOURCE_TYPE_LABELS
      ? (sourceTypeRaw as WywoSourceType)
      : undefined;

  const subscriptionId =
    typeof sp.subscriptionId === "string" && sp.subscriptionId ? sp.subscriptionId : undefined;

  const company = typeof sp.company === "string" && sp.company ? sp.company : undefined;

  const [worlds, { items }] = await Promise.all([
    listWywoWorldsForOwner(actor.phoneE164),
    listWywoMessages(actor, {
      direction: "inbox",
      perPage: 50,
      q,
      trustRing,
      worldId: worldId ?? null,
      sourceType,
      subscriptionId: subscriptionId ?? null,
      company,
    }),
  ]);

  const worldOptions = [
    { value: "", label: "All worlds" },
    ...worlds.map((w) => ({
      value: w.worldId,
      label: w.name ?? (w.company ? `${w.company}` : w.worldId),
      hint: w.company ?? undefined,
    })),
  ];

  const trustRingOptions = [
    { value: "", label: "All rings" },
    ...Object.entries(WYWO_TRUST_RING_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const sourceTypeOptions = [
    { value: "", label: "All types" },
    ...WYWO_SOURCE_TYPE_OPTIONS.map((v) => ({ value: v, label: WYWO_SOURCE_TYPE_LABELS[v] })),
  ];

  const subscriptionOptions = [
    { value: "", label: "All subscriptions" },
    ...Array.from(new Set(worlds.map((w) => w.subscriptionId).filter((s): s is string => !!s))).map(
      (s) => ({ value: s, label: s }),
    ),
  ];

  const companyOptions = [
    { value: "", label: "All companies" },
    ...Array.from(new Set(worlds.map((w) => w.company).filter((c): c is string => !!c))).map(
      (c) => ({ value: c, label: c }),
    ),
  ];

  return (
    <div>
      <AdminDirectoryPageHeader
        title="Inbox"
        description="One trusted inbox. Filter by trust ring, world, subscription, company, and message type."
      />
      <div className="mt-6">
        <WywoUnifiedInboxFilters
          worldOptions={worldOptions}
          trustRingOptions={trustRingOptions}
          subscriptionOptions={subscriptionOptions}
          companyOptions={companyOptions}
          sourceTypeOptions={sourceTypeOptions}
          defaultQuery={q ?? ""}
          defaultWorldId={worldId ?? ""}
          defaultTrustRing={trustRing ?? ""}
          defaultSubscriptionId={subscriptionId ?? ""}
          defaultCompany={company ?? ""}
          defaultSourceType={sourceType ?? ""}
        />
      </div>
      <div className="mt-6">
        <WywoMessageList items={items} />
      </div>
    </div>
  );
}
