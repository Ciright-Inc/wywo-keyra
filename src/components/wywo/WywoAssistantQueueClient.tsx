"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WywoMessageView } from "@/lib/wywo/types";
import type { WywoTrustStatus } from "@prisma/client";
import { WYWO_TRUST_STATUS_LABELS } from "@/lib/wywo/constants";
import { WywoTrustBadge } from "./WywoTrustBadge";
import { adminPanel, adminTable, adminTableScroll, adminTableWrap } from "@/lib/admin/adminUiClasses";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";

type Props = {
  items: WywoMessageView[];
};

const APPROVE_OPTIONS: WywoTrustStatus[] = [
  "TRUSTED",
  "FAMILY_CIRCLE",
  "EXECUTIVE_RING",
  "REFERRED",
];

export function WywoAssistantQueueClient({ items }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [ringById, setRingById] = useState<Record<string, WywoTrustStatus>>(() => {
    const initial: Record<string, WywoTrustStatus> = {};
    for (const m of items) initial[m.id] = "TRUSTED";
    return initial;
  });

  const approve = async (id: string) => {
    setError(null);
    setInfo(null);
    setBusyId(id);
    try {
      const ring = ringById[id] ?? "TRUSTED";
      const res = await fetch(`/api/wywo/messages/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ring }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setInfo("Sender approved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const block = async (id: string) => {
    setError(null);
    setInfo(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/wywo/messages/${id}/block`, { method: "POST" });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setInfo("Sender blocked.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const topItems = useMemo(() => items.slice(0, 50), [items]);

  return (
    <div className="space-y-5">
      {error ? <p className="ds-field-error">{error}</p> : null}
      {info ? <p className="ds-body-sm text-[var(--ds-ink)]">{info}</p> : null}

      <div className={`${adminPanel} p-0 overflow-hidden`}>
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Trust</th>
                  <th>Priority</th>
                  <th>World</th>
                  <th>Ring</th>
                  <th>Actions</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--ds-canvas-soft)] transition-colors">
                    <td>
                      <Link href={`/wywo/messages/${m.id}`} className="ds-text-link">
                        <span className="ds-body-sm text-[var(--ds-ink)] font-medium">
                          {m.subject || "(no subject)"}
                        </span>
                      </Link>
                      <p className="ds-caption ds-numeric">{m.senderPhone}</p>
                    </td>
                    <td>
                      <WywoTrustBadge status={m.trustStatus} />
                    </td>
                    <td>
                      <span className="ds-caption-uppercase">{m.priority}</span>
                    </td>
                    <td>
                      <span className="ds-caption ds-numeric">
                        {m.worldId
                          ? m.worldId.slice(0, 14) + (m.worldId.length > 14 ? "…" : "")
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="ds-text-input is-sm"
                        value={ringById[m.id] ?? "TRUSTED"}
                        onChange={(e) =>
                          setRingById((prev) => ({ ...prev, [m.id]: e.target.value as WywoTrustStatus }))
                        }
                        disabled={busyId === m.id}
                      >
                        {APPROVE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {WYWO_TRUST_STATUS_LABELS[opt]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="ds-btn-primary is-sm shrink-0"
                          onClick={() => approve(m.id)}
                          disabled={busyId === m.id}
                        >
                          {busyId === m.id ? "Working…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="ds-btn-secondary is-sm shrink-0"
                          onClick={() => block(m.id)}
                          disabled={busyId === m.id}
                        >
                          {busyId === m.id ? "Working…" : "Block"}
                        </button>
                      </div>
                    </td>
                    <td className="ds-caption">{formatAdminDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

