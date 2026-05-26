import Link from "next/link";
import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoPhoneFilterField } from "@/components/wywo/WywoPhoneFilterField";
import { WywoSelectFilterField } from "@/components/wywo/WywoSelectFilterField";
import { WywoTrustBadge } from "@/components/wywo/WywoTrustBadge";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import {
  adminCatalogStatBox,
  adminCatalogStatGrid,
  adminCatalogStatLabel,
  adminCatalogStatValue,
  adminPanel,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";
import { assertWywoAdminActor } from "@/lib/wywo/auth";
import { listAdminMessages } from "@/lib/wywo/messages";
import { prisma } from "@/lib/prisma";
import type { WywoTrustStatus } from "@prisma/client";

type Search = {
  q?: string;
  phone?: string;
  worldId?: string;
  subscriptionId?: string;
  trustStatus?: string;
  page?: string;
};

const TRUST_OPTIONS: WywoTrustStatus[] = [
  "TRUSTED",
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "REFERRED",
  "PENDING_REVIEW",
  "UNKNOWN",
  "BLOCKED",
  "SUPPRESSED",
  "EXPIRED",
  "REVOKED",
];

export default async function WywoAdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await assertWywoAdminActor("/wywo/admin");
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const trustStatus =
    sp.trustStatus && TRUST_OPTIONS.includes(sp.trustStatus as WywoTrustStatus)
      ? (sp.trustStatus as WywoTrustStatus)
      : undefined;
  const [{ items, total }, totals] = await Promise.all([
    listAdminMessages({
      query: sp.q,
      phone: sp.phone,
      worldId: sp.worldId,
      subscriptionId: sp.subscriptionId,
      trustStatus,
      page,
      perPage: 50,
    }),
    prisma.$transaction([
      prisma.keyraWywoMessage.count(),
      prisma.keyraWywoMessage.count({ where: { trustStatus: "PENDING_REVIEW" } }),
      prisma.keyraWywoMessage.count({ where: { trustStatus: "BLOCKED" } }),
      prisma.keyraWywoInvite.count(),
      prisma.keyraWywoWorld.count(),
    ]),
  ]);
  const [allMessages, pending, blocked, invites, worlds] = totals;

  return (
    <div>
      <AdminDirectoryPageHeader
        title="WYWO administration"
        description="All messages across the Keyra network. Filter by world, subscription, phone, or trust state."
      />

      <div className={`${adminCatalogStatGrid} mt-4`}>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Messages</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{allMessages}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Pending trust</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{pending}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Blocked</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{blocked}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Invites</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{invites}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Worlds</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{worlds}</p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-3 items-end" method="get">
        <label className="flex-1 min-w-[200px]">
          <span className="ds-caption-uppercase">Search</span>
          <input className="ds-text-input is-sm w-full" name="q" defaultValue={sp.q ?? ""} placeholder="Subject or sender name" />
        </label>
        <label className="min-w-[280px]">
          <span className="ds-caption-uppercase">Phone</span>
          <WywoPhoneFilterField name="phone" defaultValue={sp.phone ?? ""} placeholder="87 555 0100" />
        </label>
        <label>
          <span className="ds-caption-uppercase">World</span>
          <input className="ds-text-input is-sm" name="worldId" defaultValue={sp.worldId ?? ""} placeholder="kwy_…" />
        </label>
        <label>
          <span className="ds-caption-uppercase">Subscription</span>
          <input className="ds-text-input is-sm" name="subscriptionId" defaultValue={sp.subscriptionId ?? ""} placeholder="sub_…" />
        </label>
        <label className="min-w-[180px]">
          <span className="ds-caption-uppercase">Trust</span>
          <WywoSelectFilterField
            name="trustStatus"
            defaultValue={sp.trustStatus ?? ""}
            placeholder="all"
            options={[
              { value: "", label: "All trust states" },
              ...TRUST_OPTIONS.map((o) => ({ value: o, label: o })),
            ]}
          />
        </label>
        <button type="submit" className="ds-btn-primary is-sm">Filter</button>
      </form>

      <div className={`${adminPanel} mt-6 p-0 overflow-hidden`}>
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Subject</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Trust</th>
                  <th>Status</th>
                  <th>World</th>
                  <th>Subscription</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td className="ds-caption">{formatAdminDateTime(m.createdAt)}</td>
                    <td>
                      <Link className="ds-text-link" href={`/wywo/messages/${m.id}`}>
                        {m.subject || "(no subject)"}
                      </Link>
                    </td>
                    <td>
                      <span className="ds-body-sm">{m.senderName}</span>
                      <p className="ds-caption ds-numeric">{m.senderPhone}</p>
                    </td>
                    <td>
                      <span className="ds-body-sm">{m.recipientName ?? "—"}</span>
                      <p className="ds-caption ds-numeric">{m.recipientPhone}</p>
                    </td>
                    <td><WywoTrustBadge status={m.trustStatus} /></td>
                    <td><span className="ds-caption-uppercase">{m.messageStatus}</span></td>
                    <td className="ds-caption ds-numeric">{m.worldId ?? "—"}</td>
                    <td className="ds-caption ds-numeric">{m.subscriptionId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-4 ds-caption">
        Showing page <span className="ds-numeric">{page}</span> · <span className="ds-numeric">{items.length}</span>{" "}
        of <span className="ds-numeric">{total}</span> matching messages.
      </p>
    </div>
  );
}
