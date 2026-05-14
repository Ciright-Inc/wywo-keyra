"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type Row = {
  id: string;
  countryName: string;
  iso2: string;
  region: string;
  active: boolean;
  percentageWeight: number;
  displayPriority: number;
  notes: string | null;
};

type SortKey = "priority" | "weight" | "name";

export default function AdminAuthCountriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const q = new URLSearchParams();
    if (sortBy === "weight") q.set("sort", "weight");
    else if (sortBy === "name") q.set("sort", "name");
    else q.set("sort", "priority");
    const res = await fetch(`/api/admin/authentication-countries?${q}`, { credentials: "include" });
    const data = (await res.json()) as { countries?: Row[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load");
    setRows(data.countries ?? []);
    setSelected({});
  }, [sortBy]);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  function patchRow(id: string, patch: Partial<Row>) {
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

  async function saveRow(r: Row) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/authentication-countries/${r.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: r.countryName,
          iso2: r.iso2,
          region: r.region,
          active: r.active,
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
          iso2: r.iso2,
          region: r.region,
          active: r.active,
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
    const sel = rows.filter((r) => selected[r.id] && r.active);
    const sum = sel.reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);
    if (sel.length === 0 || sum <= 0) {
      setError("Select active rows with positive weights to normalize.");
      return;
    }
    setError(null);
    setRows((prev) =>
      prev.map((r) => {
        if (!selected[r.id] || !r.active) return r;
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
        body: JSON.stringify({ ...draft, active: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setDraft({ countryName: "", iso2: "", region: "", percentageWeight: 5, displayPriority: 0 });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  const activeSum = rows.filter((r) => r.active).reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);

  return (
    <div className="space-y-6 text-keyra-primary">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Authentication countries</h1>
        <p className="mt-2 max-w-2xl text-sm text-keyra-text-2">
          Active rows participate in the keyra.ie demo feed. Weights are normalized to 100% at generation
          time. Sum of raw weights (active): <span className="font-medium text-keyra-primary">{activeSum.toFixed(2)}</span>
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-keyra-border bg-keyra-surface/40 px-3 py-2 text-sm">
        <label className="flex items-center gap-2 text-keyra-text-2">
          Sort
          <select
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1 text-keyra-primary"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            disabled={busy}
          >
            <option value="priority">Display priority</option>
            <option value="weight">Weight (desc)</option>
            <option value="name">Name</option>
          </select>
        </label>
        <span className="text-keyra-text-2">
          Selected: <span className="font-medium text-keyra-primary">{selectedIds.length}</span>
        </span>
        <Button type="button" variant="secondary" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetActive(true)}>
          Set active
        </Button>
        <Button type="button" variant="secondary" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSetActive(false)}>
          Set inactive
        </Button>
        <Button type="button" variant="secondary" disabled={busy || selectedIds.length === 0} onClick={normalizeSelectedActiveWeights}>
          Normalize weights (selected)
        </Button>
        <Button type="button" disabled={busy || selectedIds.length === 0} onClick={() => void bulkSave()}>
          Bulk save selected
        </Button>
      </div>

      <div className="rounded-xl border border-keyra-border bg-keyra-surface/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Add country</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Country name"
            value={draft.countryName}
            onChange={(e) => setDraft((d) => ({ ...d, countryName: e.target.value }))}
          />
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="ISO2"
            value={draft.iso2}
            onChange={(e) => setDraft((d) => ({ ...d, iso2: e.target.value }))}
          />
          <input
            className="rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm"
            placeholder="Region"
            value={draft.region}
            onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-keyra-text-2">
            Weight
            <input
              type="number"
              className="w-28 rounded-md border border-keyra-border bg-keyra-bg px-2 py-1.5 text-sm text-keyra-primary"
              value={draft.percentageWeight}
              onChange={(e) => setDraft((d) => ({ ...d, percentageWeight: Number(e.target.value) }))}
            />
          </label>
          <Button type="button" disabled={busy} onClick={() => void addRow()}>
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-keyra-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-keyra-border bg-keyra-bg/80 text-[11px] uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-2 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} disabled={busy || rows.length === 0} aria-label="Select all" />
              </th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">ISO2</th>
              <th className="px-3 py-2">Region</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2" />
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
          <p className="px-3 py-6 text-center text-sm text-keyra-text-2">No rows yet. Run seed script or add above.</p>
        ) : null}
      </div>
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
  row: Row;
  selected: boolean;
  onToggleSelect: () => void;
  onChange: (id: string, patch: Partial<Row>) => void;
  onSave: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  disabled: boolean;
}) {
  return (
    <tr className="border-b border-keyra-border/60">
      <td className="px-2 py-1.5 align-middle">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} disabled={disabled} aria-label={`Select ${row.countryName}`} />
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-full min-w-[120px] rounded border border-keyra-border bg-keyra-bg px-1 py-1 text-sm"
          value={row.countryName}
          onChange={(e) => onChange(row.id, { countryName: e.target.value })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-14 rounded border border-keyra-border bg-keyra-bg px-1 py-1 text-sm uppercase"
          value={row.iso2}
          onChange={(e) => onChange(row.id, { iso2: e.target.value })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          className="w-full min-w-[100px] rounded border border-keyra-border bg-keyra-bg px-1 py-1 text-sm"
          value={row.region}
          onChange={(e) => onChange(row.id, { region: e.target.value })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="checkbox"
          checked={row.active}
          onChange={(e) => onChange(row.id, { active: e.target.checked })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          className="w-20 rounded border border-keyra-border bg-keyra-bg px-1 py-1 text-sm"
          value={row.percentageWeight}
          onChange={(e) => onChange(row.id, { percentageWeight: Number(e.target.value) })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="number"
          className="w-16 rounded border border-keyra-border bg-keyra-bg px-1 py-1 text-sm"
          value={row.displayPriority}
          onChange={(e) => onChange(row.id, { displayPriority: Number(e.target.value) })}
          disabled={disabled}
        />
      </td>
      <td className="flex flex-wrap gap-1 px-2 py-1.5">
        <Button type="button" variant="secondary" disabled={disabled} onClick={() => void onSave()}>
          Save
        </Button>
        <Button type="button" variant="secondary" disabled={disabled} onClick={() => void onDelete()}>
          Delete
        </Button>
      </td>
    </tr>
  );
}
