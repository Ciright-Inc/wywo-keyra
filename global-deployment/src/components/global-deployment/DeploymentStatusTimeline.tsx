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
    return <p className="text-sm text-amber-700">{error}</p>;
  }
  if (entries === null) {
    return <p className="text-sm text-keyra-text-2">Loading deployment history…</p>;
  }
  if (entries.length === 0) {
    return <p className="text-sm text-keyra-text-2">No published status transitions recorded for this country.</p>;
  }

  return (
    <ol className="space-y-3 border-l border-keyra-border pl-4">
      {entries.map((e, i) => {
        const next = deploymentStatusPresentation(e.nextStatus as DeploymentStatus);
        const prev = e.previousStatus
          ? deploymentStatusPresentation(e.previousStatus as DeploymentStatus)
          : null;
        return (
          <li key={`${e.changedAt}-${i}`} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-keyra-accent/70" aria-hidden />
            <p className="text-xs text-keyra-text-2">{formatOptionalTs(new Date(e.changedAt))}</p>
            <p className="mt-1 text-keyra-primary">
              {prev ? (
                <>
                  {prev.label} → {next.label}
                </>
              ) : (
                <>{next.label}</>
              )}
            </p>
            {e.reason ? <p className="mt-1 text-xs text-keyra-text-2">{e.reason}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
