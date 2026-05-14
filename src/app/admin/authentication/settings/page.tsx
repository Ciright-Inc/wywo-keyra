"use client";

"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Settings = {
  id: string;
  feedEnabled: boolean;
  initialRecordsCount: number;
  batchSize: number;
  fetchThreshold: number;
  sessionUniquenessLimit: number;
  maskingEnabled: boolean;
  obfuscationEnabled: boolean;
  maxRecordsPerSession: number;
  animationSpeedMs: number;
  refreshBehavior: string;
};

export default function AdminAuthFeedSettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/authentication-feed-settings", { credentials: "include" });
    const data = (await res.json()) as { settings?: Settings; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setS(data.settings ?? null);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function save() {
    if (!s) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/authentication-feed-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!s) {
    return <p className="text-sm text-keyra-text-2">Loading…</p>;
  }

  return (
    <div className="max-w-xl space-y-4 text-keyra-primary">
      <h1 className="text-2xl font-semibold tracking-tight">Authentication feed settings</h1>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.feedEnabled} onChange={(e) => setS({ ...s, feedEnabled: e.target.checked })} />
        Feed enabled
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.maskingEnabled} onChange={(e) => setS({ ...s, maskingEnabled: e.target.checked })} />
        Masking enabled
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Initial batch count" v={s.initialRecordsCount} on={(n) => setS({ ...s, initialRecordsCount: n })} />
        <Field label="Batch size" v={s.batchSize} on={(n) => setS({ ...s, batchSize: n })} />
        <Field label="Fetch threshold (rows remaining)" v={s.fetchThreshold} on={(n) => setS({ ...s, fetchThreshold: n })} />
        <Field label="Session uniqueness limit" v={s.sessionUniquenessLimit} on={(n) => setS({ ...s, sessionUniquenessLimit: n })} />
        <Field label="Max records / session" v={s.maxRecordsPerSession} on={(n) => setS({ ...s, maxRecordsPerSession: n })} />
        <Field label="Animation speed (ms)" v={s.animationSpeedMs} on={(n) => setS({ ...s, animationSpeedMs: n })} />
      </div>
      <Button type="button" disabled={busy} onClick={() => void save()}>
        Save settings
      </Button>
    </div>
  );
}

function Field({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <label className="block text-sm text-keyra-text-2">
      {label}
      <input
        type="number"
        className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-keyra-primary"
        value={v}
        onChange={(e) => on(Number(e.target.value))}
      />
    </label>
  );
}
