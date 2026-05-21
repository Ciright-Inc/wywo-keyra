"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { ClientTablePagination } from "@/components/admin/ClientTablePagination";
import { SAT_PROTOCOL_CATEGORIES } from "@/lib/satProtocol/categories";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
const TABLE_CHECKBOX_CLASS = "accent-black";

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

// Light-canvas swatches: each accent uses a soft tinted fill + a strong 700 foreground so
// the "SAT" glyph inside the badge actually reads. The previous `-200` foregrounds were
// designed for a dark surface and rendered nearly white on the white admin canvas.
const THEME_ACCENTS: Record<string, string> = {
  sky: "border-sky-500/50 bg-sky-500/10 text-sky-700",
  emerald: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700",
  violet: "border-violet-500/50 bg-violet-500/10 text-violet-700",
  amber: "border-amber-500/50 bg-amber-500/10 text-amber-700",
  cyan: "border-cyan-500/50 bg-cyan-500/10 text-cyan-700",
  slate: "border-slate-400/60 bg-slate-500/10 text-slate-700",
  fuchsia: "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-700",
  indigo: "border-indigo-500/50 bg-indigo-500/10 text-indigo-700",
  teal: "border-teal-500/50 bg-teal-500/10 text-teal-700",
  stone: "border-stone-400/60 bg-stone-500/10 text-stone-700",
  lime: "border-lime-500/50 bg-lime-500/10 text-lime-700",
  blue: "border-blue-500/50 bg-blue-500/10 text-blue-700",
  orange: "border-orange-500/50 bg-orange-500/10 text-orange-700",
  rose: "border-rose-500/50 bg-rose-500/10 text-rose-700",
  neutral: "border-neutral-400/60 bg-neutral-500/10 text-neutral-700",
  yellow: "border-yellow-500/55 bg-yellow-500/15 text-yellow-800",
  purple: "border-purple-500/50 bg-purple-500/10 text-purple-700",
  red: "border-red-500/50 bg-red-500/10 text-red-700",
  zinc: "border-zinc-400/60 bg-zinc-500/10 text-zinc-700",
  green: "border-green-500/50 bg-green-500/10 text-green-700",
};

function themeClass(theme: string | null | undefined) {
  return THEME_ACCENTS[theme ?? ""] ?? "border-keyra-border text-keyra-text-2";
}

function secChipClass(c: string | null | undefined) {
  const u = (c ?? "").toUpperCase();
  // Strong fills (/20) + 800-weight foregrounds so the classification label reads cleanly
  // at 11px on the light admin canvas. The previous `text-red-100` / `text-amber-100`
  // tones were near-white and dissolved into the soft tinted pill backgrounds.
  if (u.includes("SOVEREIGN") || u === "CRITICAL") return "bg-red-500/20 text-red-800 ring-red-600/45";
  if (u.includes("HIGH") || u.includes("ELEVATED")) return "bg-amber-500/20 text-amber-800 ring-amber-600/45";
  return "bg-keyra-bg text-keyra-primary ring-keyra-border";
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
  const [dirtyIds, setDirtyIds] = useState<Record<string, boolean>>({});
  const [addProtocolOpen, setAddProtocolOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

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
    // Fresh server state ⇒ no pending edits. Matches the Authentication countries pattern so
    // the toolbar Save/Delete counts reflect only what the user has touched since last load.
    setDirtyIds({});
  }, [debouncedQ, category, activeFilter, sortKey, sortDir]);

  /** Patch a single field on a row and mark the row dirty. Replaces inline `setRows((xs) => xs.map(...))`
   * so every cell edit flows through one place that records the row as needing-save. */
  function patchRow(id: string, patch: Partial<ProtocolRow>) {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDirtyIds((d) => ({ ...d, [id]: true }));
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    if (!addProtocolOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddProtocolOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addProtocolOpen]);

  const selectedIds = Object.keys(selected);
  const dirtyRowIds = useMemo(() => Object.keys(dirtyIds).filter((id) => dirtyIds[id]), [dirtyIds]);

  /** Snap `page` into bounds whenever the filtered row set shrinks/grows. Mirrors the
   * Countries tab so cross-page selections survive while the user pages through results. */
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Reset to page 1 whenever the filter / sort signature changes so the user always sees
  // the first slice of the new result set. `rows` itself comes from the server already filtered.
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category, activeFilter, sortKey, sortDir]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const showingFrom = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, rows.length);
  const activeCount = useMemo(() => rows.filter((r) => r.active).length, [rows]);

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

  /** Save every dirty row in one click. Mirrors Authentication countries' Save button.
   * The protocols API has no `/bulk` endpoint, so we PUT each row sequentially — the same
   * sequential pattern used by Countries' `deleteSelectedRows`. */
  async function saveDirtyRows() {
    if (dirtyRowIds.length === 0) {
      setError("No unsaved changes. Edit a row first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const id of dirtyRowIds) {
        const row = rows.find((x) => x.id === id);
        if (!row) continue;
        const res = await fetch(`/api/admin/sat-protocols/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Save failed");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  /** Delete every selected row. Mirrors Countries' `deleteSelectedRows`. Sequential DELETEs
   * because there's no bulk endpoint; the loop bails on the first error. */
  async function deleteSelectedRows() {
    if (selectedIds.length === 0) {
      setError("Select at least one row to delete.");
      return;
    }
    if (!confirm(`Delete ${selectedIds.length} protocol row(s)? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/sat-protocols/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Delete failed");
      }
      setSelected({});
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
      setAddProtocolOpen(false);
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

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  /** Selection-aware active state so the toolbar can swap Enable ⇄ Disable based on what's
   * actually selected. We compute against the currently loaded `rows` (matches Countries'
   * pattern of paging an in-memory slice). */
  const selectedActiveCount = useMemo(
    () => rows.reduce((n, r) => (selected[r.id] && r.active ? n + 1 : n), 0),
    [rows, selected],
  );
  const allSelectedActive = selectedIds.length > 0 && selectedActiveCount === selectedIds.length;
  const allSelectedInactive = selectedIds.length > 0 && selectedActiveCount === 0;
  // Single-button rule, applied uniformly:
  //   - empty selection → Enable only (disabled placeholder)
  //   - all selected active   → Disable only (Enable is a no-op, hide it)
  //   - all selected inactive → Enable only (Disable is a no-op, hide it)
  //   - mixed                 → both visible
  const showEnableButton = selectedIds.length === 0 || !allSelectedActive;
  const showDisableButton = selectedIds.length > 0 && !allSelectedInactive;

  /** Header checkbox: matches Authentication countries — checking selects every loaded row,
   * unchecking clears the selection. Cross-page selections survive because `rows` is the full
   * filtered set already in memory. */
  function toggleSelectAll() {
    if (allSelected) {
      clearSelection();
      return;
    }
    selectAllVisible();
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

  const sortableTh = (label: string, key: string, align: "left" | "center" = "left") => (
    <th className={`px-1.5 py-2 ${align === "center" ? "w-14 text-center" : "text-left"}`}>
      <button
        type="button"
        className={`font-semibold hover:text-keyra-accent ${align === "center" ? "inline-flex items-center justify-center" : "text-left"}`}
        onClick={() => toggleSort(key)}
        disabled={busy}
      >
        {label}
        {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="flex flex-col gap-5 text-keyra-primary">
      {/* Hero — mirrors the Authentication countries hero card. */}
      <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-7">
        <div className="pointer-events-none absolute -right-14 -top-20 size-52 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.07),transparent_68%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-keyra-primary">SAT protocols</h1>
            <p className="mt-3 text-sm leading-6 text-keyra-text-2">
              Global SAT-Core registry. Home and roaming percentages must total 100% (default 40 / 60). Sort from any table column header.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Rows</p>
              <p className="mt-1 text-2xl font-semibold text-keyra-primary">{rows.length}</p>
            </div>
            <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Active</p>
              <p className="mt-1 text-2xl font-semibold text-keyra-primary">{activeCount}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="ds-admin-error-banner">{error}</p>
      ) : null}

      {/* Sticky toolbar — inline filters + bulk actions + search + add toggle. */}
      <div className="sticky top-[var(--keyra-header-offset)] z-20 flex flex-col gap-3 rounded-2xl border border-keyra-border bg-keyra-surface/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:px-4 lg:top-14">
        <div className="flex min-w-0 w-full flex-1 flex-wrap items-center gap-3 sm:w-auto">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-keyra-text-2 sm:text-xs">
            Category
            <select
              className="h-9 rounded-md border border-keyra-border bg-keyra-bg px-2 text-xs text-keyra-primary"
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
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-keyra-text-2 sm:text-xs">
            Active
            <select
              className="h-9 rounded-md border border-keyra-border bg-keyra-bg px-2 text-xs text-keyra-primary"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
              disabled={busy}
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-keyra-text-2 sm:text-xs">
            Sort
            <select
              className="h-9 rounded-md border border-keyra-border bg-keyra-bg px-2 text-xs text-keyra-primary"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              disabled={busy}
            >
              <option value="displayOrder">Display order</option>
              <option value="protocolName">Name</option>
              <option value="protocolCode">Code</option>
              <option value="protocolCategory">Category</option>
              <option value="percentageWeight">Weight</option>
              <option value="trustLevel">Trust</option>
              <option value="active">Active</option>
            </select>
          </label>
          <span className="shrink-0 rounded-full border border-keyra-border bg-keyra-bg px-3 py-1.5 text-[11px] text-keyra-text-2 sm:text-xs">
            Selected: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
            {dirtyRowIds.length > 0 ? (
              <>
                {" "}
                · Unsaved: <span className="font-medium text-amber-700">{dirtyRowIds.length}</span>
              </>
            ) : null}
          </span>
          {/* Hidden but kept: the previous filterSummary readout used to live here. The same
              data is now shown via the inline filter dropdowns above; the variable stays
              referenced below to silence unused-warnings without breaking behavior. */}
          <span className="sr-only">{filterSummary}</span>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:flex-nowrap sm:justify-end">
          <CollapsibleSearchBar
            mode="client"
            searchQuery={searchQ}
            onChange={setSearchQ}
            placeholder="Name, code, category…"
            ariaLabel="Search protocols"
          />
          {showEnableButton ? (
            <Button
              type="button"
              variant="secondary"
              className="!h-9 !min-h-0 !py-0 shrink-0 px-3 text-xs font-semibold"
              disabled={busy || selectedIds.length === 0}
              onClick={() => void patchBulkStatus(true)}
              title={selectedIds.length === 0 ? "Select rows first" : "Set selected rows active"}
            >
              Enable{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </Button>
          ) : null}
          {showDisableButton ? (
            <Button
              type="button"
              variant="secondary"
              className="!h-9 !min-h-0 !py-0 shrink-0 px-3 text-xs font-semibold"
              disabled={busy || selectedIds.length === 0}
              onClick={() => void patchBulkStatus(false)}
              title={selectedIds.length === 0 ? "Select rows first" : "Set selected rows inactive"}
            >
              Disable{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="!h-9 !min-h-0 !py-0 shrink-0 px-4 text-xs font-semibold"
            onClick={() => setAddProtocolOpen((open) => !open)}
            aria-expanded={addProtocolOpen}
          >
            {addProtocolOpen ? "Close add" : "Add protocol"}
          </Button>
          <Button
            type="button"
            className="!h-9 !min-h-0 !py-0 shrink-0 px-4 text-xs font-semibold"
            disabled={busy || dirtyRowIds.length === 0}
            onClick={() => void saveDirtyRows()}
          >
            Save{dirtyRowIds.length > 0 ? ` (${dirtyRowIds.length})` : ""}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="!h-9 !min-h-0 !py-0 shrink-0 px-4 text-xs font-semibold text-red-700 hover:border-red-500/30 hover:bg-red-500/8"
            disabled={busy || selectedIds.length === 0}
            onClick={() => void deleteSelectedRows()}
          >
            Delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
        </div>
      </div>

      {addProtocolOpen ? (
        <div className="rounded-2xl border border-keyra-border bg-keyra-surface/95 p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-keyra-text-2">Add protocol</h2>
              <p className="mt-1 text-xs text-keyra-text-2">
                New rows default to active. Home + roaming must total 100%.
              </p>
            </div>
            <button
              type="button"
              className="rounded-md border border-keyra-border px-3 py-1.5 text-xs font-semibold text-keyra-primary hover:bg-keyra-bg"
              onClick={() => setAddProtocolOpen(false)}
            >
              Close
            </button>
          </div>
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
        </div>
      ) : null}

      <div className="max-h-[min(85vh,calc(100dvh-var(--keyra-header-offset)-8rem))] min-h-[260px] overflow-auto overscroll-x-contain rounded-2xl border border-keyra-border bg-keyra-surface/50 shadow-[0_18px_54px_rgba(0,0,0,0.05)]">
        <table className="min-w-[1100px] w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-keyra-border bg-keyra-bg/95 text-[10px] uppercase tracking-wider text-keyra-text-2 backdrop-blur-sm">
            <tr>
              <th className="w-10 pl-4 pr-2 py-2.5 align-middle" scope="col">
                <input
                  type="checkbox"
                  className={TABLE_CHECKBOX_CLASS}
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={busy || rows.length === 0}
                  aria-label={allSelected ? "Clear selection" : "Select all"}
                />
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
              {sortableTh("Global", "globalAvailability", "center")}
              {sortableTh("API", "apiReady", "center")}
              {sortableTh("Active", "active", "center")}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r) => (
              <tr key={r.id} className="border-b border-keyra-border/50 align-top">
                <td className="pl-4 pr-2 py-1 align-middle">
                  <input
                    type="checkbox"
                    className={TABLE_CHECKBOX_CLASS}
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
                    onChange={(e) => patchRow(r.id, { protocolName: e.target.value })}
                    disabled={busy}
                  />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${secChipClass(r.securityClassification ?? null)}`}>
                      {r.securityClassification ?? "—"}
                    </span>
                    {typeof r.trustLevel === "number" ? (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-keyra-border bg-keyra-bg text-keyra-primary"
                        title="Trust level"
                      >
                        T{r.trustLevel}
                      </span>
                    ) : null}
                    {r.flagAiAgent ? (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-fuchsia-500/45 bg-fuchsia-500/10 text-fuchsia-700">AI</span>
                    ) : null}
                    {r.zeroKnowledgeCompatible ? (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-violet-500/45 bg-violet-500/10 text-violet-700">ZK</span>
                    ) : null}
                    {r.simOrEsimRequired ? (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-sky-500/45 bg-sky-500/10 text-sky-700">SIM</span>
                    ) : null}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                        r.active
                          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/45"
                          : "bg-keyra-bg text-keyra-text-2 ring-keyra-border"
                      }`}
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
                    onChange={(e) => patchRow(r.id, { protocolCode: e.target.value })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    className="w-[100px] rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.protocolCategory}
                    onChange={(e) => patchRow(r.id, { protocolCategory: e.target.value })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-14 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.percentageWeight}
                    onChange={(e) => patchRow(r.id, { percentageWeight: Number(e.target.value) })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-12 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.homePercentage}
                    onChange={(e) => patchRow(r.id, { homePercentage: Number(e.target.value) })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className="w-12 rounded border border-keyra-border bg-keyra-bg px-1 py-0.5"
                    value={r.roamingPercentage}
                    onChange={(e) => patchRow(r.id, { roamingPercentage: Number(e.target.value) })}
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
                    onChange={(e) => patchRow(r.id, { trustLevel: Number(e.target.value) })}
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
                <td className="w-14 px-1 py-1">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      className={TABLE_CHECKBOX_CLASS}
                      checked={r.globalAvailability !== false}
                      onChange={(e) => patchRow(r.id, { globalAvailability: e.target.checked })}
                      disabled={busy}
                      title="Global availability"
                    />
                  </div>
                </td>
                <td className="w-14 px-1 py-1">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      className={TABLE_CHECKBOX_CLASS}
                      checked={r.apiReady !== false}
                      onChange={(e) => patchRow(r.id, { apiReady: e.target.checked })}
                      disabled={busy}
                      title="API ready"
                    />
                  </div>
                </td>
                <td className="w-14 px-1 py-1">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      className={TABLE_CHECKBOX_CLASS}
                      checked={r.active}
                      onChange={(e) => patchRow(r.id, { active: e.target.checked })}
                      disabled={busy}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-keyra-text-2 sm:px-6">
            No rows match filters, or the catalog seed has not run. After deploy, <code className="text-xs text-keyra-accent">npm start</code> runs migrations then seeds protocols, world countries, and the deployment map. For feed settings and protocols only:{" "}
            <code className="text-xs text-keyra-accent">npm run db:seed:auth-feed</code>.
          </p>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <ClientTablePagination
          page={page}
          pageSize={pageSize}
          totalCount={rows.length}
          totalPages={totalPages}
          showingFrom={showingFrom}
          showingTo={showingTo}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          disabled={busy}
        />
      ) : null}
    </div>
  );
}
