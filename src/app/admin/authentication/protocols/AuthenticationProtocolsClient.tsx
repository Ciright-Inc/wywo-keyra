"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import {
  deleteAuthenticationProtocolMessage,
  deleteAuthenticationProtocolsMessage,
} from "@/lib/admin/adminDeleteMessages";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import { AdminCatalogHero } from "@/components/admin/AdminCatalogHero";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { AdminFormPanelCloseButton } from "@/components/admin/AdminFormPanelCloseButton";
import { AdminEditIconButton } from "@/components/admin/AdminEditIconButton";
import { ClientTablePagination } from "@/components/admin/ClientTablePagination";
import { AuthenticationProtocolFormFields } from "./AuthenticationProtocolFormFields";
import {
  emptyProtocolFormValues,
  protocolFormValuesFromRow,
  protocolFormValuesToPayload,
  validateProtocolForm,
  type ProtocolFormValues,
} from "@/lib/authenticationFeed/protocolFormValidation";
import { SAT_PROTOCOL_CATEGORIES } from "@/lib/satProtocol/categories";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import {
  adminBody,
  adminCheckbox,
  adminFilterLabel,
  adminFilterLabelWide,
  adminFilterToolbar,
  adminInlineFormBody,
  adminPageTitle,
  adminPageToolbar,
  adminPanel,
  adminSectionTitle,
  adminSubsectionTitle,
  adminTableCellInput,
  adminTableDense,
  adminTableDenseScroll,
  adminTableWrap,
  adminToolbarBtnDanger,
  adminToolbarBtnPrimary,
  adminToolbarBtnSecondary,
  adminToolbarMeta,
  adminToolbarStrip,
} from "@/lib/admin/adminUiClasses";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const protocolCellInput = adminTableCellInput;

type ProtocolRow = {
  id: string;
  protocolName: string;
  protocolCode: string;
  protocolSlug: string | null;
  protocolCategory: string;
  active: boolean;
  percentageWeight: number;
  protocolMemo?: string;
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
  return THEME_ACCENTS[theme ?? ""] ?? "border-[var(--ds-hairline-strong)] text-[var(--ds-body)]";
}

function secChipClass(c: string | null | undefined) {
  const u = (c ?? "").toUpperCase();
  // Strong fills (/20) + 800-weight foregrounds so the classification label reads cleanly
  // at 11px on the light admin canvas. The previous `text-red-100` / `text-amber-100`
  // tones were near-white and dissolved into the soft tinted pill backgrounds.
  if (u.includes("SOVEREIGN") || u === "CRITICAL") return "bg-red-500/20 text-red-800 ring-red-600/45";
  if (u.includes("HIGH") || u.includes("ELEVATED")) return "bg-amber-500/20 text-amber-800 ring-amber-600/45";
  return "bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)] ring-[var(--ds-hairline-strong)]";
}

export function AuthenticationProtocolsClient({
  initialProtocols,
}: {
  initialProtocols?: ProtocolRow[];
}) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const skipInitialFetch = useRef(initialProtocols != null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const [rows, setRows] = useState<ProtocolRow[] | null>(initialProtocols ?? null);
  const [loading, setLoading] = useState(initialProtocols == null);
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
  const [addDraft, setAddDraft] = useState<ProtocolFormValues>(() => emptyProtocolFormValues());
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editRow, setEditRow] = useState<ProtocolRow | null>(null);
  const [editDraft, setEditDraft] = useState<ProtocolFormValues>(() => emptyProtocolFormValues());
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 280);
    return () => clearTimeout(t);
  }, [searchQ]);

  const load = useCallback(async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (category) params.set("category", category);
      if (activeFilter !== "all") params.set("active", activeFilter);
      params.set("sort", `${sortKey}:${sortDir}`);
      const res = await fetch(`/api/admin/sat-protocols?${params.toString()}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const data = (await res.json()) as { protocols?: ProtocolRow[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      if (controller.signal.aborted) return;
      setRows(data.protocols ?? []);
      setDirtyIds({});
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      throw e;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [debouncedQ, category, activeFilter, sortKey, sortDir]);

  /** Patch a single field on a row and mark the row dirty. Replaces inline `setRows((xs) => xs.map(...))`
   * so every cell edit flows through one place that records the row as needing-save. */
  function patchRow(id: string, patch: Partial<ProtocolRow>) {
    setRows((xs) => (xs ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDirtyIds((d) => ({ ...d, [id]: true }));
  }

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  useEffect(() => {
    if (!addProtocolOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddProtocolOpen(false);
        setAddErrors({});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addProtocolOpen]);

  useEffect(() => {
    if (!editRow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editRow]);

  function openEditPanel(row: ProtocolRow) {
    if (editRow?.id === row.id) {
      closeEditPanel();
      return;
    }
    setError(null);
    setAddProtocolOpen(false);
    setAddErrors({});
    setEditRow(row);
    setEditDraft(protocolFormValuesFromRow(row));
    setEditErrors({});
  }

  function closeEditPanel() {
    setEditRow(null);
    setEditErrors({});
  }

  function openAddPanel() {
    closeEditPanel();
    setError(null);
    setAddDraft(emptyProtocolFormValues());
    setAddErrors({});
    setAddProtocolOpen(true);
  }

  const selectedIds = Object.keys(selected);
  const dirtyRowIds = useMemo(() => Object.keys(dirtyIds).filter((id) => dirtyIds[id]), [dirtyIds]);

  const dataRows = rows ?? [];
  const hasActiveFilters = Boolean(debouncedQ || category || activeFilter !== "all");

  /** Snap `page` into bounds whenever the filtered row set shrinks/grows. Mirrors the
   * Countries tab so cross-page selections survive while the user pages through results. */
  const totalPages = Math.max(1, Math.ceil(dataRows.length / pageSize));
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
    return dataRows.slice(start, start + pageSize);
  }, [dataRows, page, pageSize]);

  const isInitialLoading = loading && rows === null;
  const isRefreshing = loading && rows !== null;

  const showingFrom = dataRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, dataRows.length);
  const activeCount = useMemo(() => dataRows.filter((r) => r.active).length, [dataRows]);

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
      showAdminActionToast(toast, "saved", "auth-protocol", { name: r.protocolName });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRow(id: string) {
    const row = dataRows.find((r) => r.id === id);
    if (!(await confirm(deleteAuthenticationProtocolMessage(row?.protocolName ?? "this protocol")))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/sat-protocols/${id}`, { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      showAdminActionToast(toast, "deleted", "auth-protocol", { name: row?.protocolName });
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
    for (const id of dirtyRowIds) {
      const row = dataRows.find((x) => x.id === id);
      if (!row) continue;
      const rowErrors = validateProtocolForm(protocolFormValuesFromRow(row));
      if (Object.keys(rowErrors).length > 0) {
        setError(`Fix validation errors on "${row.protocolName}" before saving. Use Edit for a full form.`);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      for (const id of dirtyRowIds) {
        const row = dataRows.find((x) => x.id === id);
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
      showAdminActionToast(toast, "saved", "auth-protocol", { count: dirtyRowIds.length });
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
    const selectedNames = dataRows
      .filter((r) => selectedIds.includes(r.id))
      .map((r) => r.protocolName);
    const firstName = selectedNames[0];
    if (!(await confirm(deleteAuthenticationProtocolsMessage(selectedIds.length, firstName)))) return;
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
      showAdminActionToast(toast, "deleted", "auth-protocol", { count: selectedIds.length, name: firstName });
      setSelected({});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    const errors = validateProtocolForm(addDraft);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      setError("Fix the highlighted fields before adding this protocol.");
      return;
    }
    setBusy(true);
    setError(null);
    setAddErrors({});
    try {
      const res = await fetch("/api/admin/sat-protocols", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...protocolFormValuesToPayload(addDraft),
          protocolUrlEnabled: false,
          allowProtocolLink: false,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      showAdminActionToast(toast, "created", "auth-protocol", { name: addDraft.protocolName });
      setAddDraft(emptyProtocolFormValues());
      setAddProtocolOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEditRow() {
    if (!editRow) return;
    const errors = validateProtocolForm(editDraft);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      setError("Fix the highlighted fields before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    setEditErrors({});
    try {
      const res = await fetch(`/api/admin/sat-protocols/${editRow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(protocolFormValuesToPayload(editDraft)),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showAdminActionToast(toast, "saved", "auth-protocol", { name: editDraft.protocolName });
      closeEditPanel();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
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
      showAdminActionToast(toast, "updated", "auth-protocol", { count: selectedIds.length });
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
      showAdminActionToast(toast, "updated", "auth-protocol", { count: selectedIds.length });
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
    for (const r of dataRows) m[r.id] = true;
    setSelected(m);
  }

  function clearSelection() {
    setSelected({});
  }

  const allSelected = dataRows.length > 0 && selectedIds.length === dataRows.length;

  /** Selection-aware active state so the toolbar can swap Enable ⇄ Disable based on what's
   * actually selected. We compute against the currently loaded `rows` (matches Countries'
   * pattern of paging an in-memory slice). */
  const selectedActiveCount = useMemo(
    () => dataRows.reduce((n, r) => (selected[r.id] && r.active ? n + 1 : n), 0),
    [dataRows, selected],
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
    <th className={align === "center" ? "text-center" : undefined} aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        className={`ds-table-sort ${align === "center" ? "w-full justify-center" : ""}`}
        onClick={() => toggleSort(key)}
        disabled={busy}
      >
        {label}
        {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div>
      {error ? <p className="ds-admin-error-banner">{error}</p> : null}

      <AdminCatalogHero
        title="SAT protocols"
        description="Global SAT-Core registry. Home and roaming percentages must total 100% (default 40 / 60). Sort from any table column header."
        srOnly={filterSummary}
        stats={[
          { label: "Rows", value: loading ? "—" : String(dataRows.length) },
          { label: "Active", value: loading ? "—" : String(activeCount) },
        ]}
        search={
          <CollapsibleSearchBar
            mode="client"
            searchQuery={searchQ}
            onChange={setSearchQ}
            placeholder="Name, code, category…"
            ariaLabel="Search protocols"
          />
        }
      />

      <div className={adminToolbarStrip}>
        <div className={adminFilterToolbar}>
          <label className={adminFilterLabelWide}>
            Category
            <AdminSelectMenu
              value={category}
              onChange={setCategory}
              disabled={busy}
              wide
              aria-label="Filter by category"
              options={[
                { value: "", label: "All" },
                ...SAT_PROTOCOL_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
          </label>
          <label className={adminFilterLabel}>
            Active
            <AdminSelectMenu
              value={activeFilter}
              onChange={(value) => setActiveFilter(value as typeof activeFilter)}
              disabled={busy}
              aria-label="Filter by active status"
              options={[
                { value: "all", label: "All" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
          </label>
          <label className={adminFilterLabel}>
            Sort
            <AdminSelectMenu
              value={sortKey}
              onChange={setSortKey}
              disabled={busy}
              aria-label="Sort protocols"
              options={[
                { value: "displayOrder", label: "Display order" },
                { value: "protocolName", label: "Name" },
                { value: "protocolCode", label: "Code" },
                { value: "protocolCategory", label: "Category" },
                { value: "percentageWeight", label: "Weight" },
                { value: "trustLevel", label: "Trust" },
                { value: "active", label: "Active" },
              ]}
            />
          </label>
          <span className={adminToolbarMeta}>
            Selected: <span className="font-medium text-[var(--ds-ink)]">{selectedIds.length}</span>
            {dirtyRowIds.length > 0 ? (
              <>
                {" "}
                · Unsaved: <span className="font-medium text-[var(--ds-warning)]">{dirtyRowIds.length}</span>
              </>
            ) : null}
          </span>
        </div>

        <div className={`${adminPageToolbar} w-full sm:ml-auto sm:w-auto`}>
          {showEnableButton ? (
            <button
              type="button"
              className={adminToolbarBtnSecondary}
              disabled={busy || selectedIds.length === 0}
              onClick={() => void patchBulkStatus(true)}
              title={selectedIds.length === 0 ? "Select rows first" : "Set selected rows active"}
            >
              Enable{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
          ) : null}
          {showDisableButton ? (
            <button
              type="button"
              className={adminToolbarBtnSecondary}
              disabled={busy || selectedIds.length === 0}
              onClick={() => void patchBulkStatus(false)}
              title={selectedIds.length === 0 ? "Select rows first" : "Set selected rows inactive"}
            >
              Disable{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </button>
          ) : null}
          <button
            type="button"
            className={addProtocolOpen ? adminToolbarBtnSecondary : adminToolbarBtnPrimary}
            onClick={() => (addProtocolOpen ? setAddProtocolOpen(false) : openAddPanel())}
            aria-expanded={addProtocolOpen}
            disabled={busy}
          >
            {addProtocolOpen ? "Close create form" : "Add protocol"}
          </button>
          <button
            type="button"
            className={adminToolbarBtnPrimary}
            disabled={busy || dirtyRowIds.length === 0}
            onClick={() => void saveDirtyRows()}
          >
            Save{dirtyRowIds.length > 0 ? ` (${dirtyRowIds.length})` : ""}
          </button>
          <button
            type="button"
            className={adminToolbarBtnDanger}
            disabled={busy || selectedIds.length === 0}
            onClick={() => void deleteSelectedRows()}
          >
            Delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </button>
        </div>
      </div>

      {addProtocolOpen ? (
        <div className={`${adminPanel} mt-3`}>
          <h2 className={adminSectionTitle}>Add protocol</h2>
          <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
            Same fields as the list. Required: name, code, category, weight. Home + roam must total 100%.
          </p>
          <div className={adminInlineFormBody}>
            <AuthenticationProtocolFormFields
              values={addDraft}
              errors={addErrors}
              disabled={busy}
              onChange={(patch) => {
                setAddDraft((current) => ({ ...current, ...patch }));
                setAddErrors((current) => {
                  const next = { ...current };
                  for (const key of Object.keys(patch)) delete next[key];
                  return next;
                });
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button type="button" size="sm" disabled={busy} onClick={() => void add()}>
                Add protocol
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editRow ? (
        <>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className={adminPageTitle}>Edit protocol</h1>
              <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>{editRow.protocolName}</p>
            </div>
            <AdminFormPanelCloseButton variant="back" disabled={busy} onClick={closeEditPanel} />
          </div>
          <div className={`${adminPanel} mt-6`}>
            <div className={adminInlineFormBody}>
            <AuthenticationProtocolFormFields
              values={editDraft}
              errors={editErrors}
              disabled={busy}
              onChange={(patch) => {
                setEditDraft((current) => ({ ...current, ...patch }));
                setEditErrors((current) => {
                  const next = { ...current };
                  for (const key of Object.keys(patch)) delete next[key];
                  return next;
                });
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={closeEditPanel}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={busy} onClick={() => void saveEditRow()}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
        </>
      ) : null}

      {isInitialLoading ? (
        <AdminDirectorySkeleton tab="auth-protocols" tableOnly rows={8} />
      ) : (
        <>
      <div className={`${adminTableWrap} mt-3 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableDenseScroll}>
        <table className={`${adminTableDense} min-w-[1100px]`}>
          <thead>
            <tr>
              <th className="w-10" scope="col">
                <input
                  type="checkbox"
                  className={adminCheckbox}
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  disabled={busy || dataRows.length === 0}
                  aria-label={allSelected ? "Clear selection" : "Select all"}
                />
              </th>
              <th>SAT</th>
              {sortableTh("Name", "protocolName")}
              {sortableTh("Code", "protocolCode")}
              {sortableTh("Category", "protocolCategory")}
              {sortableTh("Wt", "percentageWeight")}
              {sortableTh("Home", "homePercentage")}
              {sortableTh("Roam", "roamingPercentage")}
              {sortableTh("Trust", "trustLevel")}
              <th>Flags</th>
              {sortableTh("Global", "globalAvailability", "center")}
              {sortableTh("API", "apiReady", "center")}
              {sortableTh("Active", "active", "center")}
              <th className="is-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r) => (
              <tr
                key={r.id}
                className={editRow?.id === r.id ? "bg-[var(--ds-canvas-soft)] ring-1 ring-inset ring-[var(--ds-ink)]/10" : undefined}
              >
                <td className="pl-4 pr-2 py-1 align-middle">
                  <input
                    type="checkbox"
                    className={adminCheckbox}
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
                    className={`${protocolCellInput} w-[130px]`}
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
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]"
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
                          : "bg-[var(--ds-canvas-soft)] text-[var(--ds-body)] ring-[var(--ds-hairline-strong)]"
                      }`}
                      title="Feed / registry activity"
                    >
                      {r.active ? "live" : "off"}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-1">
                  <input
                    className={`${protocolCellInput} w-[88px] font-mono`}
                    value={r.protocolCode}
                    onChange={(e) => patchRow(r.id, { protocolCode: e.target.value })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    className={`${protocolCellInput} w-[100px]`}
                    value={r.protocolCategory}
                    onChange={(e) => patchRow(r.id, { protocolCategory: e.target.value })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className={`${protocolCellInput} w-14`}
                    value={r.percentageWeight}
                    onChange={(e) => patchRow(r.id, { percentageWeight: Number(e.target.value) })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className={`${protocolCellInput} w-12`}
                    value={r.homePercentage}
                    onChange={(e) => patchRow(r.id, { homePercentage: Number(e.target.value) })}
                    disabled={busy}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="number"
                    className={`${protocolCellInput} w-12`}
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
                    className={`${protocolCellInput} w-10`}
                    value={r.trustLevel ?? 4}
                    onChange={(e) => patchRow(r.id, { trustLevel: Number(e.target.value) })}
                    disabled={busy}
                  />
                </td>
                <td className="font-mono text-[10px] leading-tight text-[var(--ds-body)]">
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
                      className={adminCheckbox}
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
                      className={adminCheckbox}
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
                      className={adminCheckbox}
                      checked={r.active}
                      onChange={(e) => patchRow(r.id, { active: e.target.checked })}
                      disabled={busy}
                    />
                  </div>
                </td>
                <td className="is-actions">
                  <AdminEditIconButton
                    aria-label={`Edit ${r.protocolName}`}
                    disabled={busy}
                    active={editRow?.id === r.id}
                    onClick={() => openEditPanel(r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dataRows.length === 0 ? (
          <AdminListEmptyState
            variant="panel"
            hasSearch={hasActiveFilters}
            entityName="protocols"
            className="border-0 bg-transparent px-4 py-8 text-center shadow-none sm:px-6"
          />
        ) : null}
        </div>
      </div>

      {dataRows.length > 0 ? (
        <ClientTablePagination
          page={page}
          pageSize={pageSize}
          totalCount={dataRows.length}
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
        </>
      )}
    </div>
  );
}