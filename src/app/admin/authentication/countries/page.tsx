"use client";

import type { AuthenticationCountry } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogToolsOpen, setCatalogToolsOpen] = useState(false);

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
  }, [sortBy, q, region, subRegion, activeFilter, authFilter, weightMin, weightMax]);

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

  function patchRow(id: string, patch: Partial<AuthenticationCountry>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.id] = true;
    setSelected(next);
  }

  async function saveRow(r: AuthenticationCountry) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/authentication-countries/${r.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
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
      const updates = selectedIds.map((id) => {
        const r = rows.find((x) => x.id === id);
        if (!r) return null;
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
      });
      const res = await fetch("/api/admin/authentication-countries/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: updates.filter(Boolean) }),
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

  async function deleteRow(id: string) {
    if (!confirm("Delete this country row?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/authentication-countries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
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
    <div className="flex flex-col gap-4 text-keyra-primary">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Authentication countries</h1>
        <p className="mt-1 text-xs text-keyra-text-2">
          <span className="font-medium text-keyra-primary">{rows.length}</span> rows · Eligible weight sum{" "}
          <span className="font-medium text-keyra-primary">{activeSum.toFixed(2)}</span>. Open{" "}
          <button
            type="button"
            className="text-keyra-accent underline underline-offset-2 hover:text-keyra-primary"
            onClick={() => setCatalogToolsOpen(true)}
          >
            Catalog tools
          </button>{" "}
          for search, filters, bulk actions, and adding a country.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-keyra-border bg-keyra-surface/50 px-3 py-2.5 sm:px-4">
        <Button type="button" variant="secondary" className="h-9 shrink-0 px-4 py-1.5 text-xs font-semibold" onClick={() => setCatalogToolsOpen(true)}>
          Catalog tools…
        </Button>
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-keyra-text-2 sm:text-xs">{filterSummary}</p>
        <span className="shrink-0 text-[11px] text-keyra-text-2 sm:text-xs">
          Selected: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
        </span>
      </div>

      <div className="max-h-[min(85vh,calc(100dvh-11rem))] min-h-[240px] overflow-auto rounded-xl border border-keyra-border bg-keyra-surface/30 shadow-sm">
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
              <th className="pr-4 pl-2 py-2.5 align-middle" scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <CountryEditorRow
                key={r.id}
                row={r}
                selected={Boolean(selected[r.id])}
                onToggleSelect={() => toggleSelect(r.id)}
                onChange={patchRow}
                onSave={() => void saveRow(r)}
                onDelete={() => void deleteRow(r.id)}
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
                <p className="mt-1 text-xs text-keyra-text-2">Search, filters, bulk actions, and add country. Press Escape to close.</p>
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
                <div className="mt-3 space-y-3 rounded-lg border border-keyra-border bg-keyra-bg/40 p-4">
                  <label className="flex flex-col gap-1 text-keyra-text-2">
                    Search
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        className="min-h-9 min-w-0 flex-1 rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-keyra-primary"
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        placeholder="Name, ISO, region…"
                        disabled={busy}
                      />
                      <Button type="button" variant="secondary" className="h-9 shrink-0 px-3 py-1.5 text-xs font-semibold" disabled={busy} onClick={() => setQ(qInput)}>
                        Apply search
                      </Button>
                    </div>
                  </label>
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
                    <Button type="button" className="h-9 px-3 py-1.5 text-xs font-semibold" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSave()}>
                      Bulk save
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
                  <code className="rounded bg-keyra-bg px-1 py-0.5">RESET_AUTH_COUNTRY_WEIGHTS=1</code>. The feed uses rows that are{" "}
                  <strong>active</strong> and <strong>authentication enabled</strong>; weights normalize at generation.
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
  onToggleSelect,
  onChange,
  onSave,
  onDelete,
  disabled,
}: {
  row: AuthenticationCountry;
  selected: boolean;
  onToggleSelect: () => void;
  onChange: (id: string, patch: Partial<AuthenticationCountry>) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  disabled: boolean;
}) {
  const inp =
    "h-8 min-h-8 w-full rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-[11px] leading-tight text-keyra-primary placeholder:text-keyra-text-2/50";
  return (
    <tr className="border-b border-keyra-border/50 align-middle transition-colors hover:bg-keyra-bg/40">
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
      <td className="pr-4 pl-2 py-1.5 align-middle">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="secondary" className="h-8 px-2.5 py-1 text-[11px] font-semibold" disabled={disabled} onClick={() => void onSave()}>
            Save
          </Button>
          <Button type="button" variant="secondary" className="h-8 px-2.5 py-1 text-[11px] font-semibold" disabled={disabled} onClick={() => void onDelete()}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
