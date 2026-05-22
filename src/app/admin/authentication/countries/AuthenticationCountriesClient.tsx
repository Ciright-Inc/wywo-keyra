"use client";

import type { AuthenticationCountry } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { deleteAuthenticationCountriesMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import { AdminDirectorySkeleton } from "@/components/admin/AdminDirectorySkeleton";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { AdminFormPanelCloseButton } from "@/components/admin/AdminFormPanelCloseButton";
import { AdminEditIconButton } from "@/components/admin/AdminEditIconButton";
import { ClientTablePagination } from "@/components/admin/ClientTablePagination";
import { AdminCatalogHero } from "@/components/admin/AdminCatalogHero";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AuthenticationCountryFormFields } from "./AuthenticationCountryFormFields";
import {
  adminBody,
  adminCheckbox,
  adminFilterLabel,
  adminFilterSelect,
  adminInlineFormBody,
  adminPageTitle,
  adminPageToolbar,
  adminPanel,
  adminSectionTitle,
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
import {
  authCountryFormValuesFromRow,
  authCountryFormValuesToPayload,
  emptyAuthCountryFormValues,
  validateAuthCountryForm,
  type AuthCountryFormValues,
} from "@/lib/authenticationFeed/countryFormValidation";

type SortKey = "priority" | "weight" | "name" | "iso2" | "updated";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

function fmtDate(d: Date | string): string {
  try {
    const x = typeof d === "string" ? new Date(d) : d;
    return Number.isNaN(x.getTime()) ? "—" : x.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export function AuthenticationCountriesClient({
  initialCountries,
}: {
  initialCountries?: AuthenticationCountry[];
}) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const skipInitialFetch = useRef(initialCountries != null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const [rows, setRows] = useState<AuthenticationCountry[] | null>(initialCountries ?? null);
  const [loading, setLoading] = useState(initialCountries == null);
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
  const [addCountryOpen, setAddCountryOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<AuthCountryFormValues>(() => emptyAuthCountryFormValues());
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editRow, setEditRow] = useState<AuthenticationCountry | null>(null);
  const [editDraft, setEditDraft] = useState<AuthCountryFormValues>(() => emptyAuthCountryFormValues());
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  /** Client-side paging over the already-loaded `rows`. Server fetch returns everything matching
   * the current filters in one pass, so paging here is just a render slice — keeps cross-page
   * `selected`/`dirtyIds` state intact and lets users edit rows on page 1, jump to page 3, edit
   * more, then Save once. */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const load = useCallback(async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    setError(null);
    setLoading(true);
    try {
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

      const res = await fetch(`/api/admin/authentication-countries?${params}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const data = (await res.json()) as { countries?: AuthenticationCountry[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      if (controller.signal.aborted) return;
      setRows(data.countries ?? []);
      setSelected({});
      setDirtyIds({});
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      throw e;
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [sortBy, q, region, subRegion, activeFilter, authFilter, weightMin, weightMax]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  /** Reset to page 1 whenever the active filter/search/sort changes — otherwise typing a new
   * search while sitting on e.g. page 4 would show an empty slice until the user clicks back. */
  useEffect(() => {
    setPage(1);
  }, [q, region, subRegion, activeFilter, authFilter, weightMin, weightMax, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 280);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    if (!addCountryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddCountryOpen(false);
        setAddErrors({});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addCountryOpen]);

  useEffect(() => {
    if (!editRow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editRow]);

  function openEditPanel(row: AuthenticationCountry) {
    if (editRow?.id === row.id) {
      closeEditPanel();
      return;
    }
    setError(null);
    setAddCountryOpen(false);
    setAddErrors({});
    setEditRow(row);
    setEditDraft(authCountryFormValuesFromRow(row));
    setEditErrors({});
  }

  function closeEditPanel() {
    setEditRow(null);
    setEditErrors({});
  }

  function openAddPanel() {
    closeEditPanel();
    setError(null);
    setAddDraft(emptyAuthCountryFormValues());
    setAddErrors({});
    setAddCountryOpen(true);
  }

  function patchRow(id: string, patch: Partial<AuthenticationCountry>) {
    setRows((prev) => (prev ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirtyIds((d) => ({ ...d, [id]: true }));
    setSelected((s) => ({ ...s, [id]: true }));
  }

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const dirtyRowIds = useMemo(() => Object.keys(dirtyIds).filter((id) => dirtyIds[id]), [dirtyIds]);
  const dataRows = rows ?? [];
  const hasActiveFilters = Boolean(
    q.trim() || region || subRegion || activeFilter || authFilter || weightMin.trim() || weightMax.trim(),
  );

  const allSelected = dataRows.length > 0 && selectedIds.length === dataRows.length;

  /** Snap `page` into bounds whenever the filtered row set shrinks/grows. Runs after `load()`
   * replaces `rows`, when the filter chips change, or when the user picks a new `pageSize`. */
  const totalPages = Math.max(1, Math.ceil(dataRows.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return dataRows.slice(start, start + pageSize);
  }, [dataRows, page, pageSize]);

  const showingFrom = dataRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, dataRows.length);

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
    for (const r of dataRows) next[r.id] = true;
    setSelected(next);
  }

  async function saveDirtyRows() {
    if (dirtyRowIds.length === 0) {
      setError("No unsaved changes. Edit a row first.");
      return;
    }
    for (const id of dirtyRowIds) {
      const row = dataRows.find((x) => x.id === id);
      if (!row) continue;
      const rowErrors = validateAuthCountryForm(authCountryFormValuesFromRow(row));
      if (Object.keys(rowErrors).length > 0) {
        setError(`Fix validation errors on "${row.countryName}" before saving. Use Edit for a full form.`);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const updates = dirtyRowIds
        .map((id) => dataRows.find((x) => x.id === id))
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
      showAdminActionToast(toast, "saved", "auth-country", { count: dirtyRowIds.length });
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
        .map((id) => dataRows.find((x) => x.id === id))
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
      showAdminActionToast(toast, "saved", "auth-country", { count: selectedIds.length });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk save failed");
    } finally {
      setBusy(false);
    }
  }

  function normalizeSelectedActiveWeights() {
    const sel = dataRows.filter((r) => selected[r.id] && r.active && r.authenticationEnabled);
    const sum = sel.reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);
    if (sel.length === 0 || sum <= 0) {
      setError("Select active, auth-enabled rows with positive weights to normalize.");
      return;
    }
    setError(null);
    setRows((prev) =>
      (prev ?? []).map((r) => {
        if (!selected[r.id] || !r.active || !r.authenticationEnabled) return r;
        return { ...r, percentageWeight: (Math.max(0, r.percentageWeight) / sum) * 100 };
      }),
    );
    setDirtyIds((d) => {
      const next = { ...d };
      for (const id of selectedIds) {
        const r = dataRows.find((x) => x.id === id);
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
      showAdminActionToast(toast, "updated", "auth-country", { count: selectedIds.length });
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
      showAdminActionToast(toast, "updated", "auth-country", { count: selectedIds.length });
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
      showAdminActionToast(toast, "updated", "auth-country", { count: selectedIds.length });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  }

  async function resetAllWeights() {
    if (!(await confirm({ message: "Set weight to 5 for all countries?", confirmLabel: "Apply" }))) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/authentication-countries/reset-weighting", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; updated?: number };
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      showAdminActionToast(toast, "updated", "auth-country");
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
    const selectedNames = dataRows
      .filter((r) => selectedIds.includes(r.id))
      .map((r) => r.countryName);
    const firstName = selectedNames[0];
    if (!(await confirm(deleteAuthenticationCountriesMessage(selectedIds.length, firstName)))) return;
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
      showAdminActionToast(toast, "deleted", "auth-country", { count: selectedIds.length, name: firstName });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function addRow() {
    const errors = validateAuthCountryForm(addDraft);
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      setError("Fix the highlighted fields before adding this country.");
      return;
    }
    setBusy(true);
    setError(null);
    setAddErrors({});
    try {
      const res = await fetch("/api/admin/authentication-countries", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authCountryFormValuesToPayload(addDraft)),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      showAdminActionToast(toast, "created", "auth-country", { name: addDraft.countryName });
      setAddDraft(emptyAuthCountryFormValues());
      setAddCountryOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEditRow() {
    if (!editRow) return;
    const errors = validateAuthCountryForm(editDraft);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      setError("Fix the highlighted fields before saving.");
      return;
    }
    setBusy(true);
    setError(null);
    setEditErrors({});
    try {
      const res = await fetch(`/api/admin/authentication-countries/${editRow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authCountryFormValuesToPayload(editDraft)),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      showAdminActionToast(toast, "saved", "auth-country", { name: editDraft.countryName });
      closeEditPanel();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const activeSum = dataRows
    .filter((r) => r.active && r.authenticationEnabled)
    .reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);

  const isInitialLoading = loading && rows === null;
  const isRefreshing = loading && rows !== null;

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
    <div>
      {error ? <p className="ds-admin-error-banner">{error}</p> : null}

      <AdminCatalogHero
        title="Authentication countries"
        description="Manage country eligibility, weighting, and feed visibility for authentication events."
        srOnly={filterSummary}
        stats={[
          { label: "Rows", value: loading ? "—" : String(dataRows.length) },
          { label: "Weight sum", value: loading ? "—" : activeSum.toFixed(2) },
        ]}
      />

      <div className={adminToolbarStrip}>
        <div className="flex min-w-0 w-full flex-1 flex-wrap items-center gap-3 sm:w-auto">
          <label className={adminFilterLabel}>
            Active
            <select
              className={adminFilterSelect}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "" | "true" | "false")}
              disabled={busy}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className={adminFilterLabel}>
            Auth feed
            <select
              className={adminFilterSelect}
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value as "" | "true" | "false")}
              disabled={busy}
            >
              <option value="">All</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className={adminFilterLabel}>
            Sort
            <select
              className={adminFilterSelect}
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
          <CollapsibleSearchBar
            mode="client"
            searchQuery={qInput}
            onChange={setQInput}
            placeholder="Name, ISO, region…"
            ariaLabel="Search countries"
          />
          <button
            type="button"
            className={addCountryOpen ? adminToolbarBtnSecondary : adminToolbarBtnPrimary}
            onClick={() => (addCountryOpen ? setAddCountryOpen(false) : openAddPanel())}
            aria-expanded={addCountryOpen}
            disabled={busy}
          >
            {addCountryOpen ? "Close create form" : "Add country"}
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

      {addCountryOpen ? (
        <div className={`${adminPanel} mt-3`}>
          <h2 className={adminSectionTitle}>Add country</h2>
          <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
            Same fields as the list. Required: name, ISO-2, region, weight.
          </p>
          <div className={adminInlineFormBody}>
            <AuthenticationCountryFormFields
              values={addDraft}
              errors={addErrors}
              disabled={busy}
              flagFirst
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
              <Button type="button" size="sm" disabled={busy} onClick={() => void addRow()}>
                Add country
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editRow ? (
        <>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className={adminPageTitle}>Edit country</h1>
              <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>{editRow.countryName}</p>
            </div>
            <AdminFormPanelCloseButton variant="back" disabled={busy} onClick={closeEditPanel} />
          </div>
          <div className={`${adminPanel} mt-6`}>
            <div className={adminInlineFormBody}>
            <AuthenticationCountryFormFields
              values={editDraft}
              errors={editErrors}
              disabled={busy}
              flagFirst
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
        <AdminDirectorySkeleton tab="auth-countries" tableOnly rows={8} />
      ) : (
        <>
      <div className={`${adminTableWrap} mt-3 transition-opacity ${isRefreshing ? "pointer-events-none opacity-60" : ""}`}>
        <div className={adminTableDenseScroll}>
        <table className={`${adminTableDense} min-w-[1200px]`}>
          <thead>
            <tr>
              <th className="w-10" scope="col">
                <input type="checkbox" className={adminCheckbox} checked={allSelected} onChange={toggleSelectAll} disabled={busy || dataRows.length === 0} aria-label="Select all" />
              </th>
              <th>Name</th>
              <th>Official</th>
              <th>Flag</th>
              <th>ISO2</th>
              <th>ISO3</th>
              <th>Region</th>
              <th>Sub</th>
              <th>Phone</th>
              <th>Currency</th>
              <th>Auth</th>
              <th>Active</th>
              <th>Wt</th>
              <th>Pri</th>
              <th>Updated</th>
              <th className="is-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r) => (
              <CountryEditorRow
                key={r.id}
                row={r}
                selected={Boolean(selected[r.id])}
                dirty={Boolean(dirtyIds[r.id])}
                onToggleSelect={() => toggleSelect(r.id)}
                onChange={patchRow}
                onEdit={() => openEditPanel(r)}
                isEditing={editRow?.id === r.id}
                disabled={busy}
              />
            ))}
          </tbody>
        </table>
        {dataRows.length === 0 ? (
          <AdminListEmptyState
            variant="panel"
            hasSearch={hasActiveFilters}
            entityName="countries"
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

function CountryEditorRow({
  row,
  selected,
  dirty,
  onToggleSelect,
  onChange,
  onEdit,
  isEditing,
  disabled,
}: {
  row: AuthenticationCountry;
  selected: boolean;
  dirty: boolean;
  onToggleSelect: () => void;
  onChange: (id: string, patch: Partial<AuthenticationCountry>) => void;
  onEdit: () => void;
  isEditing: boolean;
  disabled: boolean;
}) {
  const inp = adminTableCellInput;
  return (
    <tr
      className={
        isEditing
          ? "bg-[var(--ds-canvas-soft)] ring-1 ring-inset ring-[var(--ds-ink)]/10"
          : dirty
            ? "bg-amber-500/5 ring-1 ring-inset ring-amber-500/20"
            : selected
              ? "bg-[var(--ds-canvas-soft)]/80"
              : undefined
      }
    >
      <td className="w-10">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} disabled={disabled} aria-label={`Select ${row.countryName}`} className={adminCheckbox} />
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
      <td className="w-14 px-2 py-1.5 align-middle text-center text-xl leading-none" title={row.countryName}>
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
          className={adminCheckbox}
          checked={row.authenticationEnabled}
          onChange={(e) => onChange(row.id, { authenticationEnabled: e.target.checked })}
          disabled={disabled}
        />
      </td>
      <td className="px-2 py-1.5 align-middle text-center">
        <input type="checkbox" className={adminCheckbox} checked={row.active} onChange={(e) => onChange(row.id, { active: e.target.checked })} disabled={disabled} />
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
      <td className="whitespace-nowrap text-[var(--ds-body)]">{fmtDate(row.updatedAt)}</td>
      <td className="is-actions">
        <AdminEditIconButton
          aria-label={`Edit ${row.countryName}`}
          disabled={disabled}
          active={isEditing}
          onClick={onEdit}
        />
      </td>
    </tr>
  );
}
