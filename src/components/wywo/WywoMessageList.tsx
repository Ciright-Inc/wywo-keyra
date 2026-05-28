import { Fragment } from "react";
import Link from "next/link";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import {
  adminPanel,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";
import type { WywoMessageView } from "@/lib/wywo/types";
import { WywoTrustBadge } from "./WywoTrustBadge";

type Props = {
  items: WywoMessageView[];
  emptyLabel?: string;
};

export function WywoMessageList({ items, emptyLabel }: Props) {
  let lastConversationKey: string | null = null;

  function conversationKey(item: WywoMessageView): string {
    return (
      item.conversationId ??
      item.threadId ??
      [item.worldId ?? "—", item.senderPhone, item.recipientPhone ?? "—"].join("|")
    );
  }

  if (items.length === 0) {
    return (
      <div className={adminPanel}>
        <p className="ds-body-sm">{emptyLabel ?? "No messages yet."}</p>
      </div>
    );
  }
  return (
    <div className={`${adminPanel} p-0 overflow-hidden`}>
      <div className={adminTableWrap}>
        <div className={adminTableScroll}>
          <table className={adminTable}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>From / To</th>
                <th>Trust</th>
                <th>Priority</th>
                <th>World</th>
                <th>Type</th>
                <th>When</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const key = conversationKey(item);
                const showGroup = key !== lastConversationKey;
                lastConversationKey = key;

                const typeLabel = item.sourceType ?? "WYWO_NATIVE";

                return (
                  <Fragment key={item.id}>
                    {showGroup ? (
                      <tr>
                        <td colSpan={8} className="ds-caption-uppercase py-3">
                          Conversation ·{" "}
                          <span className="ds-numeric">
                            {key.length > 20 ? `${key.slice(0, 20)}…` : key}
                          </span>
                        </td>
                      </tr>
                    ) : null}
                    <tr
                      className="hover:bg-[var(--ds-canvas-soft)] transition-colors"
                    >
                      <td>
                        <Link
                          href={`/wywo/messages/${item.id}`}
                          className="ds-text-link"
                        >
                          <span className="ds-body-sm text-[var(--ds-ink)] font-medium">
                            {item.urgent ? "⚡ " : ""}
                            {item.subject || "(no subject)"}
                          </span>
                        </Link>
                        {item.referralRequired && item.referralPhoneNumber ? (
                          <p className="ds-caption">
                            Referred by{" "}
                            <span className="ds-numeric">{item.referralPhoneNumber}</span>
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <p className="ds-body-sm text-[var(--ds-ink)]">
                          {item.direction === "inbox"
                            ? item.senderName
                            : item.recipientName ?? item.recipientPhone}
                        </p>
                        <p className="ds-caption ds-numeric">
                          {item.direction === "inbox" ? item.senderPhone : item.recipientPhone}
                        </p>
                      </td>
                      <td>
                        <WywoTrustBadge status={item.trustStatus} />
                      </td>
                      <td>
                        <span className="ds-caption-uppercase">{item.priority}</span>
                      </td>
                      <td>
                        <span className="ds-caption ds-numeric">
                          {item.worldId
                            ? item.worldId.slice(0, 14) +
                              (item.worldId.length > 14 ? "…" : "")
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="ds-caption-uppercase">{typeLabel}</span>
                      </td>
                      <td className="ds-caption">{formatAdminDateTime(item.createdAt)}</td>
                      <td className="ds-caption">
                        <span className="ds-caption-uppercase">{item.messageStatus}</span>
                        {item.readAt && item.direction === "inbox" ? " · read" : ""}
                        {!item.readAt && item.direction === "inbox" ? " · unread" : ""}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
