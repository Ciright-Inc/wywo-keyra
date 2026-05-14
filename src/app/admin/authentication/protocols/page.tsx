"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SAT_PROTOCOL_CATEGORIES } from "@/lib/satProtocol/categories";

type ProtocolRow = {
  id: string;
  protocolName: string;
  protocolCode: string;
  protocolSlug: string | null;
  protocolCategory: string;
  active: boolean;
  percentageWeight: number;
  protocolMemo: string;
  protocolUrlEnabled: boolean;
  protocolUrl: string | null;
  allowProtocolLink: boolean;
  homePercentage: number;
  roamingPercentage: number;
  shortDescription?: string | null;
  longDescription?: string | null;
  securityClassification?: string | null;
  flagEnterprise?: boolean;
  flagGovernment?: boolean;
  flagTelco?: boolean;
  flagConsumer?: boolean;
  flagAiAgent?: boolean;
  displayOrder?: number;
  iconKey?: string | null;
  colorTheme?: string | null;
  trustLevel?: number;
  riskReductionScore?: number;
  globalAvailability?: boolean;
  apiReady?: boolean;
  auditRequired?: boolean;
  consentRequired?: boolean;
  zeroKnowledgeCompatible?: boolean;
  simOrEsimRequired?: boolean;
  deviceBindingRequired?: boolean;
  createdBySystem?: boolean;
};

const THEME_ACCENTS: Record<string, string> = {
  sky: "border-sky-500/45 text-sky-200",
  emerald: "border-emerald-500/45 text-emerald-200",
  violet: "border-violet-500/45 text-violet-200",
  amber: "border-amber-500/45 text-amber-200",
  cyan: "border-cyan-500/45 text-cyan-200",
  slate: "border-slate-500/45 text-slate-200",
  fuchsia: "border-fuchsia-500/45 text-fuchsia-200",
  indigo: "border-indigo-500/45 text-indigo-200",
  teal: "border-teal-500/45 text-teal-200",
  stone: "border-stone-500/45 text-stone-200",
  lime: "border-lime-500/45 text-lime-200",
  blue: "border-blue-500/45 text-blue-200",
  orange: "border-orange-500/45 text-orange-200",
  rose: "border-rose-500/45 text-rose-200",
  neutral: "border-neutral-500/45 text-neutral-200",
  yellow: "border-yellow-500/45 text-yellow-200",
  purple: "border-purple-500/45 text-purple-200",
  red: "border-red-500/45 text-red-200",
  zinc: "border-zinc-500/45 text-zinc-200",
  green: "border-green-500/45 text-green-200",
};

function themeClass(theme: string | null | undefined) {
  return THEME_ACCENTS[theme ?? ""] ?? "border-keyra-border text-keyra-text-2";
}

function secChipClass(c: string | null | undefined) {
  const u = (c ?? "").toUpperCase();
  if (u.includes("SOVEREIGN") || u === "CRITICAL") return "bg-red-500/15 text-red-100 ring-red-500/40";
  if (u.includes("HIGH") || u.includes("ELEVATED")) return "bg-amber-500/12 text-amber-100 ring-amber-500/35";
  return "bg-keyra-bg/80 text-keyra-text-2 ring-keyra-border";
}

export default function AdminSatProtocolsPage() {
  const [rows, setRows] = useState<ProtocolRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const [sortKey, setSortKey] = useState("displayOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Record<string, true>>({});
  const [catalogToolsOpen, setCatalogToolsOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 280);
    return () => clearTimeout(t);
  }, [searchQ]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (category) params.set("category", category);
    if (activeFilter !== "all") params.set("active", activeFilter);
    params.set("sort", `${sortKey}:${sortDir}`);
    const res = await fetch(`/api/admin/sat-protocols?${params.toString()}`, { credentials: "include" });
    const data = (await res.json()) as { protocols?: ProtocolRow[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setRows(data.protocols ?? []);
  }, [debouncedQ, category, activeFilter, sortKey, sortDir]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    if (!catalogToolsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatalogToolsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [catalogToolsOpen]);

  const selectedIds = Object.keys(selected);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function saveRow(r: ProtocolRow) {
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
      setSelected((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
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
    percentageWeight: 60,
    protocolMemo: "",
    homePercentage: 40,
    roamingPercentage: 60,
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
        percentageWeight: 60,
        protocolMemo: "",
        homePercentage: 40,
        roamingPercentage: 60,
      });
      setCatalogToolsOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchBulkStatus(active: boolean) {
    if (!selectedIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sat-protocols/status", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, active }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk status failed");
      setSelected({});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk status failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchBulkWeights() {
    if (!selectedIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sat-protocols/weights", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          percentageWeight: 60,
          homePercentage: 40,
          roamingPercentage: 60,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk weights failed");
      setSelected({});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk weights failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((m) => {
      const n = { ...m };
      if (n[id]) delete n[id];
      else n[id] = true;
      return n;
    });
  }

  function selectAllVisible() {
    const m: Record<string, true> = {};
    for (const r of rows) m[r.id] = true;
    setSelected(m);
  }

  function clearSelection() {
    setSelected({});
  }

  const filterSummary = useMemo(() => {
    const bits: string[] = [];
    if (debouncedQ.trim()) bits.push(`Search: "${debouncedQ.trim()}"`);
    if (category) bits.push(`Category: ${category}`);
    if (activeFilter === "true") bits.push("Active: on");
    if (activeFilter === "false") bits.push("Active: off");
    bits.push(`Sort: ${sortKey} (${sortDir})`);
    return bits.join(" · ");
  }, [debouncedQ, category, activeFilter, sortKey, sortDir]);

  const sortableTh = (label: string, key: string) => (
    <th className="px-1.5 py-2">
      <button
        type="button"
        className="text-left font-semibold hover:text-keyra-accent"
        onClick={() => toggleSort(key)}
        disabled={busy}
      >
        {label}
        {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="flex flex-col gap-4 text-keyra-primary">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SAT protocols</h1>
        <p className="mt-1 text-xs text-keyra-text-2">
          <span className="font-medium text-keyra-primary">{rows.length}</span> rows · Global SAT-Core registry. Home + roaming must total 100% (default 40% / 60%). Sort from table column headers. Open{" "}
          <button
            type="button"
            className="text-keyra-accent underline underline-offset-2 hover:text-keyra-primary"
            onClick={() => setCatalogToolsOpen(true)}
          >
            Catalog tools
          </button>{" "}
          for search, filters, bulk actions, and adding a protocol.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-keyra-border bg-keyra-surface/50 px-3 py-2.5 sm:px-4">
        <Button type="button" variant="secondary" className="h-9 shrink-0 px-4 py-1.5 text-xs font-semibold" onClick={() => setCatalogToolsOpen(true)}>
          Catalog tools…
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 shrink-0 px-3 py-1.5 text-xs font-semibold"
          disabled={busy || rows.length === 0}
          onClick={selectAllVisible}
        >
          Select visible
        </Button>
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-keyra-text-2 sm:text-xs">{filterSummary}</p>
        <span className="shrink-0 text-[11px] text-keyra-text-2 sm:text-xs">
          Selected: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
        </span>
      </div>

      <div className="max-h-[min(85vh,calc(100dvh-11rem))] min-h-[240px] overflow-auto rounded-xl border border-keyra-border bg-keyra-surface/30 shadow-sm">
        <table className="min-w-[1100px] w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-keyra-border bg-keyra-bg/95 text-[10px] uppercase tracking-wider text-keyra-text-2 backdrop-blur-sm">
            <tr>
              <th className="w-10 pl-4 pr-2 py-2.5 align-middle" scope="col">
                Sel
              </th>
              <th className="px-1.5 py-2.5 align-middle">SAT</th>
              {sortableTh("Name", "protocolName")}
              {sortableTh("Code", "protocolCode")}
              {sortableTh("Category", "protocolCategory")}
              {sortableTh("Wt", "percentageWeight")}
              {sortableTh("Home", "homePercentage")}
              {sortableTh("Roam", "roamingPercentage")}
              {sortableTh("Trust", "trustLevel")}
              <th className="px-1 py-2">Flags</th>
              {sortableTh("Global", "globalAvailability")}
              {sortableTh("API", "apiReady")}
              {sortableTh("On", "active")}
              <th className="pr-4 pl-2 py-2.5 align-middle" scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-keyra-border/50 align-top">
                <td className="pl-4 pr-2 py-1 align-middle">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={() => toggleSelect(r.id)}
                    disabled={busy}
                    aria-label={`Select ${r.protocolCode}`}
                  />
                </td>
                <td className="px-1 py-1">
                  <div
                    className={`flex size-9 items-center justify-center rounded-md border text-[9px] font-bold leading-tight ${themeClass(r.colorTheme)}`}
                    title={r.iconKey ?? "SAT-Core"}
                  >
                    SAT
                  </div>
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[130px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolName}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolName: e.target.value } : x)))
                    }
                    disabled={busy}
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={`rounded px-1 py-0.5 text-[9px] ring-1 ${secChipClass(r.securityClassification ?? null)}`}>
                      {r.securityClassification ?? "—"}
                    </span>
                    {typeof r.trustLevel === "number" ? (
                      <span className="rounded px-1 py-0.5 text-[9px] ring-1 ring-keyra-border text-keyra-accent" title="Trust level">
                        T{r.trustLevel}
                      </span>
                    ) : null}
                    {r.flagAiAgent ? (
                      <span className="rounded px-1 py-0.5 text-[9px] ring-1 ring-fuchsia-500/35 text-fuchsia-200">AI</span>
                    ) : null}
                    {r.zeroKnowledgeCompatible ? (
                      <span className="rounded px-1 py-0.5 text-[9px] ring-1 ring-violet-500/35 text-violet-200">ZK</span>
                    ) : null}
                    {r.simOrEsimRequired ? (
                      <span className="rounded px-1 py-0.5 text-[9px] ring-1 ring-sky-500/35 text-sky-200">SIM</span>
                    ) : null}
                    <span
                      className={`rounded px-1 py-0.5 text-[9px] ring-1 ${r.active ? "text-emerald-200 ring-emerald-500/35" : "text-keyra-text-2 ring-keyra-border"}`}
                      title="Feed / registry activity"
                    >
                      {r.active ? "live" : "off"}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[88px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5 font-mono"
                    value={r.protocolCode}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolCode: e.target.value } : x)))
                    }
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[100px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolCategory}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, protocolCategory: e.target.value } : x)))
                    }
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
                <td className="px-1 py-1">
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
                </td>
                <td className="px-1 py-1">
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
                    type="number"
                    min={1}
                    max={5}
                    className="w-10 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.trustLevel ?? 4}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, trustLevel: Number(e.target.value) } : x)))
                    }
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1 font-mono text-[10px] leading-tight text-keyra-text-2">
                  {r.flagEnterprise ? "E" : "·"}
                  {r.flagGovernment ? "G" : "·"}
                  {r.flagTelco ? "T" : "·"}
                  {r.flagConsumer ? "C" : "·"}
                  {r.flagAiAgent ? "A" : "·"}
                </td>
                <td className="px-1 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={r.globalAvailability !== false}
                    onChange={(e) =>
                      setRows((xs) =>
                        xs.map((x) => (x.id === r.id ? { ...x, globalAvailability: e.target.checked } : x)),
                      )
                    }
                    disabled={busy}
                    title="Global availability"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={r.apiReady !== false}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, apiReady: e.target.checked } : x)))
                    }
                    disabled={busy}
                    title="API ready"
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={r.active}
                    onChange={(e) =>
                      setRows((xs) => xs.map((x) => (x.id === r.id ? { ...x, active: e.target.checked } : x)))
                    }
                    disabled={busy}
                  />
                </td>
                <td className="pr-4 pl-2 py-1 align-middle">
                  <div className="flex flex-wrap gap-1">
                    <Button type="button" variant="secondary" disabled={busy} onClick={() => void saveRow(r)}>
                      Save
                    </Button>
                    <Button type="button" variant="secondary" disabled={busy} onClick={() => void deleteRow(r.id)}>
                      Del
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-keyra-text-2 sm:px-6">
            No rows match filters, or the catalog seed has not run. After deploy, <code className="text-xs text-keyra-accent">npm start</code> runs migrations then seeds protocols and world countries. For feed settings and protocols only:{" "}
            <code className="text-xs text-keyra-accent">npm run db:seed:auth-feed</code>.
          </p>
        ) : null}
      </div>

      {catalogToolsOpen ? (
        <div
          className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-black/55 p-4 pb-10 pt-16 backdrop-blur-[2px] sm:items-center sm:pt-4"
          role="presentation"
          onClick={() => setCatalogToolsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal
            aria-labelledby="catalog-tools-title"
            className="w-full max-w-2xl rounded-xl border border-keyra-border bg-keyra-surface p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-keyra-border pb-4">
              <div>
                <h2 id="catalog-tools-title" className="text-lg font-semibold text-keyra-primary">
                  Catalog tools
                </h2>
                <p className="mt-1 text-xs text-keyra-text-2">Search, filters, bulk actions, and add protocol. Press Escape to close.</p>
              </div>
              <button
                type="button"
                className="rounded-md border border-keyra-border px-3 py-1.5 text-xs font-semibold text-keyra-primary hover:bg-keyra-bg"
                onClick={() => setCatalogToolsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 max-h-[min(70vh,32rem)] space-y-6 overflow-y-auto pr-1 text-sm">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Search & filters</h3>
                <p className="mt-2 text-xs text-keyra-text-2">Sort order follows the column headers on the main table.</p>
                <div className="mt-3 space-y-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4">
                  <label className="flex flex-col gap-1 text-keyra-text-2">
                    Search
                    <input
                      className="min-h-9 min-w-0 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                      placeholder="Name, code, category, slug, description…"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      disabled={busy}
                    />
                  </label>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Category
                      <select
                        className="min-h-9 w-48 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={busy}
                      >
                        <option value="">All</option>
                        {SAT_PROTOCOL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Active
                      <select
                        className="min-h-9 w-32 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
                        disabled={busy}
                      >
                        <option value="all">All</option>
                        <option value="true">On</option>
                        <option value="false">Off</option>
                      </select>
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Bulk actions</h3>
                <p className="mt-2 text-xs text-keyra-text-2">
                  Selected in table: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-3 py-1.5 text-xs font-semibold"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => void patchBulkStatus(true)}
                  >
                    Enable
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-3 py-1.5 text-xs font-semibold"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => void patchBulkStatus(false)}
                  >
                    Disable
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-3 py-1.5 text-xs font-semibold"
                    disabled={busy || selectedIds.length === 0}
                    onClick={() => void patchBulkWeights()}
                  >
                    Weight 60 · H/R 40/60
                  </Button>
                  <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy} onClick={clearSelection}>
                    Clear selection
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Add protocol</h3>
                <p className="mt-1 text-xs text-keyra-text-2">New rows default to active. Home + roaming must total 100%.</p>
                <div className="mt-3 grid gap-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4 sm:grid-cols-2">
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm"
                    placeholder="Name"
                    value={draft.protocolName}
                    onChange={(e) => setDraft((d) => ({ ...d, protocolName: e.target.value }))}
                    disabled={busy}
                  />
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm"
                    placeholder="Code e.g. SAT-ID"
                    value={draft.protocolCode}
                    onChange={(e) => setDraft((d) => ({ ...d, protocolCode: e.target.value }))}
                    disabled={busy}
                  />
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm sm:col-span-2"
                    placeholder="Category"
                    value={draft.protocolCategory}
                    onChange={(e) => setDraft((d) => ({ ...d, protocolCategory: e.target.value }))}
                    disabled={busy}
                  />
                  <textarea
                    className="min-h-[72px] rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm sm:col-span-2"
                    placeholder="Protocol memo (modal body)"
                    value={draft.protocolMemo}
                    onChange={(e) => setDraft((d) => ({ ...d, protocolMemo: e.target.value }))}
                    disabled={busy}
                  />
                  <label className="flex items-center gap-2 text-sm text-keyra-text-2">
                    Weight
                    <input
                      type="number"
                      className="w-24 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                      value={draft.percentageWeight}
                      onChange={(e) => setDraft((d) => ({ ...d, percentageWeight: Number(e.target.value) }))}
                      disabled={busy}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-keyra-text-2">
                    Home %
                    <input
                      type="number"
                      className="w-20 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                      value={draft.homePercentage}
                      onChange={(e) => setDraft((d) => ({ ...d, homePercentage: Number(e.target.value) }))}
                      disabled={busy}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-keyra-text-2">
                    Roam %
                    <input
                      type="number"
                      className="w-20 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                      value={draft.roamingPercentage}
                      onChange={(e) => setDraft((d) => ({ ...d, roamingPercentage: Number(e.target.value) }))}
                      disabled={busy}
                    />
                  </label>
                  <Button type="button" disabled={busy} onClick={() => void add()}>
                    Add protocol
                  </Button>
                </div>
              </section>

              <section className="rounded-lg border border-keyra-border/80 bg-keyra-bg/30 p-4 text-xs leading-relaxed text-keyra-text-2">
                <p className="font-semibold text-keyra-primary">Data & seeding</p>
                <p className="mt-2">
                  <code className="rounded bg-keyra-bg px-1 py-0.5">npm start</code> runs migrations then the deploy catalog seed (SAT protocols and world countries). To refresh feed-related settings and protocols only:{" "}
                  <code className="rounded bg-keyra-bg px-1 py-0.5">npm run db:seed:auth-feed</code>. The feed reflects rows marked <strong>live</strong> (active) in this table; keep home + roaming percentages summing to 100%.
                </p>
              </section>
            </div>

            <div className="mt-5 flex justify-end border-t border-keyra-border pt-4">
              <Button type="button" variant="secondary" className="h-9 px-4 text-xs font-semibold" onClick={() => setCatalogToolsOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
