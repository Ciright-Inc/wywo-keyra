"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Row = {
  id: string;
  protocolName: string;
  protocolCode: string;
  protocolCategory: string;
  active: boolean;
  percentageWeight: number;
  protocolMemo: string;
  protocolUrlEnabled: boolean;
  protocolUrl: string | null;
  allowProtocolLink: boolean;
  homePercentage: number;
  roamingPercentage: number;
};

export default function AdminSatProtocolsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/sat-protocols", { credentials: "include" });
    const data = (await res.json()) as { protocols?: Row[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setRows(data.protocols ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function saveRow(r: Row) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sat-protocols/${r.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
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

  async function deleteRow(id: string) {
    if (!confirm("Delete protocol?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/sat-protocols/${id}`, { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const [draft, setDraft] = useState({
    protocolName: "",
    protocolCode: "",
    protocolCategory: "Identity",
    percentageWeight: 10,
    protocolMemo: "",
    homePercentage: 50,
    roamingPercentage: 50,
  });

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sat-protocols", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          active: true,
          protocolUrlEnabled: false,
          allowProtocolLink: false,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setDraft({
        protocolName: "",
        protocolCode: "",
        protocolCategory: "Identity",
        percentageWeight: 10,
        protocolMemo: "",
        homePercentage: 50,
        roamingPercentage: 50,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-keyra-primary">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SAT protocols</h1>
        <p className="mt-2 max-w-2xl text-sm text-keyra-text-2">
          Home + roaming must total 100%. Memo is shown on keyra.ie when visitors tap a protocol (unless
          external link is enabled).
        </p>
      </div>
      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="rounded-xl border border-keyra-border bg-keyra-surface/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Add protocol</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Name"
            value={draft.protocolName}
            onChange={(e) => setDraft((d) => ({ ...d, protocolName: e.target.value }))}
          />
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Code e.g. SAT-ID"
            value={draft.protocolCode}
            onChange={(e) => setDraft((d) => ({ ...d, protocolCode: e.target.value }))}
          />
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Category"
            value={draft.protocolCategory}
            onChange={(e) => setDraft((d) => ({ ...d, protocolCategory: e.target.value }))}
          />
          <textarea
            className="sm:col-span-2 min-h-[72px] rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Protocol memo (modal body)"
            value={draft.protocolMemo}
            onChange={(e) => setDraft((d) => ({ ...d, protocolMemo: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-keyra-text-2">
            Weight
            <input
              type="number"
              className="w-24 rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-keyra-primary"
              value={draft.percentageWeight}
              onChange={(e) => setDraft((d) => ({ ...d, percentageWeight: Number(e.target.value) }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-keyra-text-2">
            Home %
            <input
              type="number"
              className="w-20 rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-keyra-primary"
              value={draft.homePercentage}
              onChange={(e) => setDraft((d) => ({ ...d, homePercentage: Number(e.target.value) }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-keyra-text-2">
            Roam %
            <input
              type="number"
              className="w-20 rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-keyra-primary"
              value={draft.roamingPercentage}
              onChange={(e) => setDraft((d) => ({ ...d, roamingPercentage: Number(e.target.value) }))}
            />
          </label>
          <Button type="button" disabled={busy} onClick={() => void add()}>
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-keyra-border text-xs">
        <table className="min-w-full text-left">
          <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[10px] uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Code</th>
              <th className="px-2 py-2">Cat</th>
              <th className="px-2 py-2">On</th>
              <th className="px-2 py-2">Wt</th>
              <th className="px-2 py-2">H/R</th>
              <th className="px-2 py-2">Link</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-keyra-border/50">
                <td className="px-1 py-1">
                  <input
                    className="w-[110px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolName}
                    onChange={(e) => setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolName: e.target.value } : x)))}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[72px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolCode}
                    onChange={(e) => setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolCode: e.target.value } : x)))}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[80px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolCategory}
                    onChange={(e) => setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolCategory: e.target.value } : x)))}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={(e) => setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, active: e.target.checked } : x)))}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-14 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.percentageWeight}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) => (x.id === r.id ? { ...x, percentageWeight: Number(e.target.value) } : x)),
                      )
                    }
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1 whitespace-nowrap">
                  <input
                    type="number"
                    className="w-12 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.homePercentage}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) => (x.id === r.id ? { ...x, homePercentage: Number(e.target.value) } : x)),
                      )
                    }
                    disabled={busy}
                  />
                  /
                  <input
                    type="number"
                    className="w-12 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.roamingPercentage}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) => (x.id === r.id ? { ...x, roamingPercentage: Number(e.target.value) } : x)),
                      )
                    }
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="checkbox"
                    checked={r.allowProtocolLink}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, allowProtocolLink: e.target.checked } : x)))
                    }
                    disabled={busy}
                  />
                </td>
                <td className="flex gap-1 px-1 py-1">
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => void saveRow(r)}>
                    Save
                  </Button>
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => void deleteRow(r.id)}>
                    Del
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
