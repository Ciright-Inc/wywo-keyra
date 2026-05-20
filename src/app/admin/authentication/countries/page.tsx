"use client";

import type { AuthenticationCountry } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type SortKey = "priority" | "weight" | "name" | "iso2" | "updated";

function fmtDate(d: Date | string): string {
  try {
    const x = typeof d === "string" ? new Date(d) : d;
    return Number.isNaN(x.getTime()) ? "—" : x.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export default function AdminAuthCountriesPage() {
  const [rows, setRows] = useState<AuthenticationCountry[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [authFilter, setAuthFilter] = useState<"" | "true" | "false">("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [dirtyIds, setDirtyIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogToolsOpen, setCatalogToolsOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    const params = new URLSearchParams();
    if (sortBy === "weight") params.set("sort", "weight");
    else if (sortBy === "name") params.set("sort", "name");
    else if (sortBy === "iso2") params.set("sort", "iso2");
    else if (sortBy === "updated") params.set("sort", "updated");
    else params.set("sort", "priority");
    if (q.trim()) params.set("q", q.trim());
    if (region) params.set("region", region);
    if (subRegion) params.set("subRegion", subRegion);
    if (activeFilter) params.set("active", activeFilter);
    if (authFilter) params.set("authenticationEnabled", authFilter);
    if (weightMin.trim() && Number.isFinite(Number(weightMin))) params.set("weightMin", weightMin.trim());
    if (weightMax.trim() && Number.isFinite(Number(weightMax))) params.set("weightMax", weightMax.trim());

    const res = await fetch(`/api/admin/authentication-countries?${params}`, { credentials: "include" });
    const data = (await res.json()) as { countries?: AuthenticationCountry[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setRows(data.countries ?? []);
    setSelected({});
    setDirtyIds({});
  }, [sortBy, q, region, subRegion, activeFilter, authFilter, weightMin, weightMax]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 280);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    if (searchExpanded) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchExpanded]);

  function toggleSearchPanel() {
    setSearchExpanded((open) => !open);
  }

  function collapseSearch(clearQuery = false) {
    if (clearQuery) setQInput("");
    setSearchExpanded(false);
  }

  useEffect(() => {
    if (!catalogToolsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatalogToolsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [catalogToolsOpen]);

  function patchRow(id: string, patch: Partial<AuthenticationCountry>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirtyIds((d) => ({ ...d, [id]: true }));
    setSelected((s) => ({ ...s, [id]: true }));
  }

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const dirtyRowIds = useMemo(() => Object.keys(dirtyIds).filter((id) => dirtyIds[id]), [dirtyIds]);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function rowToUpdatePayload(r: AuthenticationCountry) {
    return {
      id: r.id,
      countryName: r.countryName,
      officialName: r.officialName,
      iso2: r.iso2,
      iso3: r.iso3,
      isoNumeric: r.isoNumeric,
      region: r.region,
      subRegion: r.subRegion,
      capitalCity: r.capitalCity,
      flagEmoji: r.flagEmoji,
      phoneCountryCode: r.phoneCountryCode,
      currencyCode: r.currencyCode,
      currencyName: r.currencyName,
      primaryLanguage: r.primaryLanguage,
      active: r.active,
      authenticationEnabled: r.authenticationEnabled,
      percentageWeight: r.percentageWeight,
      displayPriority: r.displayPriority,
      notes: r.notes,
    };
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.id] = true;
    setSelected(next);
  }

  async function saveDirtyRows() {
    if (dirtyRowIds.length === 0) {
      setError("No unsaved changes. Edit a row first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updates = dirtyRowIds
        .map((id) => rows.find((x) => x.id === id))
        .filter(Boolean)
        .map((r) => rowToUpdatePayload(r!));
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
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

  async function bulkSave() {
    if (selectedIds.length === 0) {
      setError("Select at least one row.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updates = selectedIds
        .map((id) => rows.find((x) => x.id === id))
        .filter(Boolean)
        .map((r) => rowToUpdatePayload(r!));
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk save failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk save failed");
    } finally {
      setBusy(false);
    }
  }

  function normalizeSelectedActiveWeights() {
    const sel = rows.filter((r) => selected[r.id] && r.active && r.authenticationEnabled);
    const sum = sel.reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);
    if (sel.length === 0 || sum <= 0) {
      setError("Select active, auth-enabled rows with positive weights to normalize.");
      return;
    }
    setError(null);
    setRows((prev) =>
      prev.map((r) => {
        if (!selected[r.id] || !r.active || !r.authenticationEnabled) return r;
        return { ...r, percentageWeight: (Math.max(0, r.percentageWeight) / sum) * 100 };
      }),
    );
    setDirtyIds((d) => {
      const next = { ...d };
      for (const id of selectedIds) {
        const r = rows.find((x) => x.id === id);
        if (r?.active && r.authenticationEnabled) next[id] = true;
      }
      return next;
    });
  }

  async function bulkSetActive(active: boolean) {
    if (selectedIds.length === 0) {
      setError("Select at least one row.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updates = selectedIds.map((id) => ({ id, active }));
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  }

  async function bulkSetAuthEnabled(authenticationEnabled: boolean) {
    if (selectedIds.length === 0) {
      setError("Select at least one row.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updates = selectedIds.map((id) => ({ id, authenticationEnabled }));
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  }

  async function bulkSetSelectedWeight(value: number) {
    if (selectedIds.length === 0) {
      setError("Select at least one row.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updates = selectedIds.map((id) => ({ id, percentageWeight: value }));
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Bulk update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetAllWeights() {
    if (!confirm("Set percentage weight to 5 for every country in the database?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/authentication-countries/reset-weighting", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; updated?: number };
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelectedRows() {
    if (selectedIds.length === 0) {
      setError("Select at least one row to delete.");
      return;
    }
    if (!confirm(`Delete ${selectedIds.length} country row(s)? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      for (const id of selectedIds) {
        const res = await fetch(`/api/admin/authentication-countries/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Delete failed");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const [draft, setDraft] = useState({
    countryName: "",
    iso2: "",
    region: "",
    percentageWeight: 5,
    displayPriority: 0,
  });

  async function addRow() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/authentication-countries", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          active: true,
          authenticationEnabled: true,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setDraft({ countryName: "", iso2: "", region: "", percentageWeight: 5, displayPriority: 0 });
      setCatalogToolsOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  const activeSum = rows
    .filter((r) => r.active && r.authenticationEnabled)
    .reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);

  const filterSummary = useMemo(() => {
    const bits: string[] = [];
    if (q.trim()) bits.push(`Search: "${q.trim()}"`);
    if (region) bits.push(`Region: ${region}`);
    if (subRegion) bits.push(`Sub: ${subRegion}`);
    if (activeFilter === "true") bits.push("Active only");
    if (activeFilter === "false") bits.push("Inactive only");
    if (authFilter === "true") bits.push("Auth feed on");
    if (authFilter === "false") bits.push("Auth feed off");
    if (weightMin.trim()) bits.push(`Wt min ${weightMin}`);
    if (weightMax.trim()) bits.push(`Wt max ${weightMax}`);
    bits.push(`Sort: ${sortBy}`);
    return bits.join(" · ");
  }, [q, region, subRegion, activeFilter, authFilter, weightMin, weightMax, sortBy]);

  return (
    <div className="flex flex-col gap-5 text-keyra-primary">
      <section className="relative overflow-hidden rounded-3xl border border-keyra-border bg-keyra-surface px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:px-7">
        <div className="pointer-events-none absolute -right-14 -top-20 size-52 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.07),transparent_68%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">
              Latest authentications
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary">
              Authentication countries
            </h1>
            <p className="mt-3 text-sm leading-6 text-keyra-text-2">
              Manage country eligibility, weighting, and feed visibility for authentication events.
              Open{" "}
              <button
                type="button"
                className="font-medium text-keyra-accent underline-offset-4 hover:text-keyra-primary hover:underline"
                onClick={() => setCatalogToolsOpen(true)}
              >
                Catalog tools
              </button>{" "}
              for filters, bulk actions, and adding a country. Use the search icon beside Save to filter rows.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Rows</p>
              <p className="mt-1 text-2xl font-semibold text-keyra-primary">{rows.length}</p>
            </div>
            <div className="rounded-2xl border border-keyra-border bg-keyra-bg/75 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Weight sum</p>
              <p className="mt-1 text-2xl font-semibold text-keyra-primary">{activeSum.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="sticky top-14 z-20 flex items-center gap-3 rounded-2xl border border-keyra-border bg-keyra-surface/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" className="h-9 shrink-0 px-4 py-1.5 text-xs font-semibold" onClick={() => setCatalogToolsOpen(true)}>
            Catalog tools…
          </Button>
          <p className="min-w-0 text-[11px] leading-snug text-keyra-text-2 sm:text-xs">{filterSummary}</p>
          <span className="shrink-0 rounded-full border border-keyra-border bg-keyra-bg px-3 py-1.5 text-[11px] text-keyra-text-2 sm:text-xs">
            Selected: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
            {dirtyRowIds.length > 0 ? (
              <>
                {" "}
                · Unsaved: <span className="font-medium text-amber-700">{dirtyRowIds.length}</span>
              </>
            ) : null}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="flex items-center">
            <button
              type="button"
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition duration-300 ${
                searchExpanded || q.trim()
                  ? "border-black/20 bg-keyra-bg text-keyra-primary ring-1 ring-black/10"
                  : "border-keyra-border bg-keyra-bg text-keyra-text-2 hover:border-black/20 hover:text-keyra-primary"
              }`}
              onClick={toggleSearchPanel}
              aria-label={searchExpanded ? "Collapse search" : "Expand search"}
              aria-expanded={searchExpanded}
              disabled={busy}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20 16.65 16.65" />
              </svg>
            </button>
            <div
              className={`grid transition-[grid-template-columns] duration-300 ease-out ${
                searchExpanded ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="Name, ISO, region…"
                    autoComplete="off"
                    disabled={busy}
                    aria-label="Search countries"
                    className={`h-9 rounded-lg border border-keyra-border bg-keyra-bg py-0 pl-3 text-sm text-keyra-primary outline-none transition-opacity duration-300 focus-visible:border-black/25 focus-visible:keyra-focus ${
                      searchExpanded ? "w-44 pr-8 opacity-100 sm:w-56" : "w-44 pointer-events-none opacity-0 sm:w-56"
                    }`}
                  />
                  {searchExpanded ? (
                    <button
                      type="button"
                      className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary"
                      onClick={() => collapseSearch(true)}
                      aria-label="Clear search and collapse"
                      disabled={busy}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

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

      <div className="max-h-[min(85vh,calc(100dvh-11rem))] min-h-[260px] overflow-auto rounded-2xl border border-keyra-border bg-keyra-surface/50 shadow-[0_18px_54px_rgba(0,0,0,0.05)]">
        <table className="min-w-[1200px] w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-keyra-border bg-keyra-bg/95 backdrop-blur-sm text-[10px] uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="w-10 pl-4 pr-2 py-2.5 align-middle" scope="col">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={busy || rows.length === 0} aria-label="Select all" />
              </th>
              <th className="px-2 py-2.5 align-middle">Name</th>
              <th className="px-2 py-2.5 align-middle">Official</th>
              <th className="px-2 py-2.5 align-middle">Flag</th>
              <th className="px-2 py-2.5 align-middle">ISO2</th>
              <th className="px-2 py-2.5 align-middle">ISO3</th>
              <th className="px-2 py-2.5 align-middle">Region</th>
              <th className="px-2 py-2.5 align-middle">Sub</th>
              <th className="px-2 py-2.5 align-middle">Phone</th>
              <th className="px-2 py-2.5 align-middle">Currency</th>
              <th className="px-2 py-2.5 align-middle">Auth</th>
              <th className="px-2 py-2.5 align-middle">Active</th>
              <th className="px-2 py-2.5 align-middle">Wt</th>
              <th className="px-2 py-2.5 align-middle">Pri</th>
              <th className="px-2 py-2.5 align-middle">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <CountryEditorRow
                key={r.id}
                row={r}
                selected={Boolean(selected[r.id])}
                dirty={Boolean(dirtyIds[r.id])}
                onToggleSelect={() => toggleSelect(r.id)}
                onChange={patchRow}
                disabled={busy}
              />
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-keyra-text-2 sm:px-6">
            No rows match filters, or the catalog seed has not run. After deploy, <code className="text-xs">npm start</code> runs migrations and seeds the catalog (including world countries and the deployment map);
            or run <code className="text-xs">npm run db:seed:world-countries</code>.
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
                <p className="mt-1 text-xs text-keyra-text-2">Filters, bulk actions, and add country. Press Escape to close.</p>
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
                <h3 className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Filters</h3>
                <div className="mt-3 space-y-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Region (exact)
                      <input
                        className="min-h-9 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        disabled={busy}
                        placeholder="e.g. Europe"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Sub-region (exact)
                      <input
                        className="min-h-9 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={subRegion}
                        onChange={(e) => setSubRegion(e.target.value)}
                        disabled={busy}
                        placeholder="e.g. Northern Europe"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-end gap-3 border-t border-keyra-border/50 pt-3">
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Active
                      <select
                        className="min-h-9 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value as "" | "true" | "false")}
                        disabled={busy}
                      >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Auth feed
                      <select
                        className="min-h-9 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={authFilter}
                        onChange={(e) => setAuthFilter(e.target.value as "" | "true" | "false")}
                        disabled={busy}
                      >
                        <option value="">All</option>
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Wt min
                      <input
                        className="min-h-9 w-20 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={weightMin}
                        onChange={(e) => setWeightMin(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Wt max
                      <input
                        className="min-h-9 w-20 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={weightMax}
                        onChange={(e) => setWeightMax(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-keyra-text-2">
                      Sort
                      <select
                        className="min-h-9 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                        disabled={busy}
                      >
                        <option value="name">Name</option>
                        <option value="iso2">ISO-2</option>
                        <option value="priority">Display priority</option>
                        <option value="weight">Weight (desc)</option>
                        <option value="updated">Updated (desc)</option>
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
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetActive(true)}>
                      Set active
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetActive(false)}>
                      Set inactive
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetAuthEnabled(true)}>
                      Auth enabled
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetAuthEnabled(false)}>
                      Auth disabled
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-keyra-border/50 pt-3">
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetSelectedWeight(5)}>
                      Weight = 5
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={normalizeSelectedActiveWeights}>
                      Normalize weights
                    </Button>
                    <Button type="button" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || dirtyRowIds.length === 0} onClick={() => void saveDirtyRows()}>
                      Save changes
                    </Button>
                    <Button type="button" variant="secondary" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy} onClick={() => void resetAllWeights()}>
                      Reset all weights to 5
                    </Button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Add country</h3>
                <p className="mt-1 text-xs text-keyra-text-2">ISO-2 must be unique. Default weight 5.</p>
                <div className="mt-3 grid gap-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4 sm:grid-cols-2">
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm"
                    placeholder="Country name"
                    value={draft.countryName}
                    onChange={(e) => setDraft((d) => ({ ...d, countryName: e.target.value }))}
                  />
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm"
                    placeholder="ISO2"
                    value={draft.iso2}
                    onChange={(e) => setDraft((d) => ({ ...d, iso2: e.target.value }))}
                  />
                  <input
                    className="rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm"
                    placeholder="Region (continent)"
                    value={draft.region}
                    onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                  />
                  <label className="flex items-center gap-2 text-sm text-keyra-text-2">
                    Weight
                    <input
                      type="number"
                      className="w-24 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary"
                      value={draft.percentageWeight}
                      onChange={(e) => setDraft((d) => ({ ...d, percentageWeight: Number(e.target.value) }))}
                    />
                  </label>
                  <Button type="button" disabled={busy} onClick={() => void addRow()}>
                    Add country
                  </Button>
                </div>
              </section>

              <section className="rounded-lg border border-keyra-border/80 bg-keyra-bg/30 p-4 text-xs leading-relaxed text-keyra-text-2">
                <p className="font-semibold text-keyra-primary">Data & seeding</p>
                <p className="mt-2">
                  <code className="rounded bg-keyra-bg px-1 py-0.5">npm start</code> runs migrations then the deploy catalog seed (world countries, deployment map regions/countries/telcos, SAT protocols). Manual:{" "}
                  <code className="rounded bg-keyra-bg px-1 py-0.5">npm run db:seed:world-countries</code>. Re-runnable; preserves weights unless{" "}
                  <code className="rounded bg-keyra-bg px-1 py-0.5">RESET_AUTH_COUNTRY_WEIGHTS=1</code>. The homepage Latest authentications panel only picks countries that are both <strong>live</strong> (ACTIVE) and <strong>authentication enabled</strong> (AUTH); weights normalize at generation.
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

function CountryEditorRow({
  row,
  selected,
  dirty,
  onToggleSelect,
  onChange,
  disabled,
}: {
  row: AuthenticationCountry;
  selected: boolean;
  dirty: boolean;
  onToggleSelect: () => void;
  onChange: (id: string, patch: Partial<AuthenticationCountry>) => void;
  disabled: boolean;
}) {
  const inp =
    "h-8 min-h-8 w-full rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-[11px] leading-tight text-keyra-primary placeholder:text-keyra-text-2/50";
  return (
    <tr
      className={`border-b border-keyra-border/50 align-middle transition-colors hover:bg-keyra-bg/40 ${
        dirty ? "bg-amber-500/5 ring-1 ring-inset ring-amber-500/20" : selected ? "bg-keyra-bg/50" : ""
      }`}
    >
      <td className="w-10 pl-4 pr-2 py-1.5 align-middle">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} disabled={disabled} aria-label={`Select ${row.countryName}`} className="size-3.5 accent-keyra-accent" />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input className={`${inp} min-w-[6.5rem]`} value={row.countryName} onChange={(e) => onChange(row.id, { countryName: e.target.value })} disabled={disabled} />
      </td>
      <td className="max-w-[10rem] px-2 py-1.5 align-middle">
        <input
          className={`${inp} min-w-0`}
          value={row.officialName ?? ""}
          onChange={(e) => onChange(row.id, { officialName: e.target.value || null })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle text-center text-base leading-none" title="Flag emoji">
        {row.flagEmoji ?? "—"}
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input className={`${inp} w-11 uppercase`} value={row.iso2} onChange={(e) => onChange(row.id, { iso2: e.target.value })} disabled={disabled} />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          className={`${inp} w-11 uppercase`}
          value={row.iso3 ?? ""}
          onChange={(e) => onChange(row.id, { iso3: e.target.value ? e.target.value.toUpperCase().slice(0, 3) : null })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input className={`${inp} min-w-[4.5rem]`} value={row.region} onChange={(e) => onChange(row.id, { region: e.target.value })} disabled={disabled} />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          className={`${inp} min-w-[5rem]`}
          value={row.subRegion ?? ""}
          onChange={(e) => onChange(row.id, { subRegion: e.target.value || null })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          className={`${inp} w-14`}
          value={row.phoneCountryCode ?? ""}
          onChange={(e) => onChange(row.id, { phoneCountryCode: e.target.value || null })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <div className="flex flex-col gap-1">
          <input
            className={`${inp} w-11 uppercase`}
            value={row.currencyCode ?? ""}
            onChange={(e) => onChange(row.id, { currencyCode: e.target.value ? e.target.value.toUpperCase().slice(0, 3) : null })}
            disabled={disabled}
            placeholder="CCY"
          />
          <input
            className={`${inp} min-w-[4rem]`}
            value={row.currencyName ?? ""}
            onChange={(e) => onChange(row.id, { currencyName: e.target.value || null })}
            disabled={disabled}
            placeholder="Name"
          />
        </div>
      </td>
      <td className="px-2 py-1.5 align-middle text-center">
        <input
          type="checkbox"
          className="size-3.5 accent-keyra-accent"
          checked={row.authenticationEnabled}
          onChange={(e) => onChange(row.id, { authenticationEnabled: e.target.checked })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle text-center">
        <input type="checkbox" className="size-3.5 accent-keyra-accent" checked={row.active} onChange={(e) => onChange(row.id, { active: e.target.checked })} disabled={disabled} />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          type="number"
          className={`${inp} w-12`}
          value={row.percentageWeight}
          onChange={(e) => onChange(row.id, { percentageWeight: Number(e.target.value) })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle">
        <input
          type="number"
          className={`${inp} w-9`}
          value={row.displayPriority}
          onChange={(e) => onChange(row.id, { displayPriority: Math.floor(Number(e.target.value)) || 0 })}
          disabled={disabled}
        />
      </td>
      <td className="whitespace-nowrap px-2 py-1.5 align-middle text-[10px] text-keyra-text-2">{fmtDate(row.updatedAt)}</td>
    </tr>
  );
}
