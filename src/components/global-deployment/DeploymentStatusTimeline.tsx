"use client";

import type { DeploymentStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { deploymentStatusPresentation } from "@/lib/deployments/status";
import { formatOptionalTs } from "@/lib/deployments/deployment-map-utils";

type Entry = {
  changedAt: string;
  previousStatus: string | null;
  nextStatus: string;
  reason: string | null;
};

export function DeploymentStatusTimeline({ publicSlug }: { publicSlug: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/public/deployments/${encodeURIComponent(publicSlug)}/status-history`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (!cancelled) setError("Unable to load deployment history.");
          return;
        }
        const json = (await res.json()) as { entries?: Entry[] };
        if (!cancelled) {
          setError(null);
          setEntries(Array.isArray(json.entries) ? json.entries : []);
        }
      } catch {
        if (!cancelled) setError("Unable to load deployment history.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicSlug]);

  if (error) {
    return <p className="text-sm text-amber-200/90">{error}</p>;
  }
  if (entries === null) {
    return <p className="text-sm text-slate-500">Loading deployment history…</p>;
  }
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No published status transitions recorded for this country.</p>;
  }

  return (
    <ol className="space-y-3 border-l border-white/10 pl-4">
      {entries.map((e, i) => {
        const next = deploymentStatusPresentation(e.nextStatus as DeploymentStatus);
        const prev = e.previousStatus
          ? deploymentStatusPresentation(e.previousStatus as DeploymentStatus)
          : null;
        return (
          <li key={`${e.changedAt}-${i}`} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-slate-500" aria-hidden />
            <p className="text-xs text-slate-500">{formatOptionalTs(new Date(e.changedAt))}</p>
            <p className="mt-1 text-slate-200">
              {prev ? (
                <>
                  {prev.label} → {next.label}
                </>
              ) : (
                <>{next.label}</>
              )}
            </p>
            {e.reason ? <p className="mt-1 text-xs text-slate-400">{e.reason}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
