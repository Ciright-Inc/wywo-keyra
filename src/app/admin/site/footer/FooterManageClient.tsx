"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminCatalogHero } from "@/components/admin/AdminCatalogHero";
import { AdminDeleteIconButton, AdminEditIconButton } from "@/components/admin/AdminEditIconButton";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminFormPanelCloseButton } from "@/components/admin/AdminFormPanelCloseButton";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";
import { SocialPlatformIcon } from "@/lib/siteFooter/socialIcons";
import {
  adminBody,
  adminCountBadge,
  adminFormInput,
  adminInlineFormBody,
  adminPageTitle,
  adminPanel,
  adminPanelSectionDivider,
  adminSectionTitle,
  adminTable,
  adminTableScroll,
  adminTableWrapInset,
  adminToolbarBtnPrimary,
  adminToolbarBtnSecondary,
} from "@/lib/admin/adminUiClasses";
import {
  matchesFooterSiteApp,
  SITE_FOOTER_MARKETING_APP_ID,
  type FooterSiteAppOption,
} from "@/lib/siteFooter/siteAppScope";
import type {
  SiteFooterConfig,
  SiteFooterLinkSection,
  SiteFooterLinkView,
  SiteFooterSocialLinkView,
} from "@/lib/siteFooter/types";
import {
  FooterLinkFormFields,
  emptyFooterLinkFormValues,
  footerLinkFormValuesFromRow,
  type FooterLinkFormValues,
} from "./FooterLinkFormFields";
import {
  FooterSocialFormFields,
  emptyFooterSocialFormValues,
  footerSocialFormValuesFromRow,
  type FooterSocialFormValues,
} from "./FooterSocialFormFields";

async function readJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

function sortLinks(links: SiteFooterLinkView[]) {
  return [...links].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

function sortSocial(links: SiteFooterSocialLinkView[]) {
  return [...links].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
}

type FooterContentTab = "brand" | "on-this-site" | "keyra-apps" | "social-media";

function FooterContentTabs({
  activeTab,
  onThisSiteLabel,
  keyraAppsLabel,
  onThisSiteCount,
  keyraAppsCount,
  socialCount,
  onChange,
}: {
  activeTab: FooterContentTab;
  onThisSiteLabel: string;
  keyraAppsLabel: string;
  onThisSiteCount: number;
  keyraAppsCount: number;
  socialCount: number;
  onChange: (tab: FooterContentTab) => void;
}) {
  const tabs: {
    id: FooterContentTab;
    label: string;
    count?: number;
  }[] = [
    { id: "brand", label: "Brand" },
    { id: "on-this-site", label: onThisSiteLabel, count: onThisSiteCount },
    { id: "keyra-apps", label: keyraAppsLabel, count: keyraAppsCount },
    { id: "social-media", label: "Social media", count: socialCount },
  ];

  return (
    <div className="mt-3">
      <div className="ds-footer-section-nav" role="tablist" aria-label="Footer sections">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`footer-section-${tab.id}`}
              id={`footer-tab-${tab.id}`}
              className={cn("ds-footer-section-nav__tab", selected && "is-active")}
              onClick={() => onChange(tab.id)}
            >
              <span className="ds-footer-section-nav__label">{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span className="ds-footer-section-nav__count">{tab.count.toLocaleString()}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const footerAdminTableClass = `${adminTable} is-footer-admin`;

function FooterLinksColgroup() {
  return (
    <colgroup>
      <col style={{ width: "15%" }} />
      <col />
      <col style={{ width: "13%" }} />
      <col style={{ width: "4.5rem" }} />
      <col style={{ width: "5.25rem" }} />
      <col style={{ width: "100px" }} />
    </colgroup>
  );
}

function FooterSocialColgroup() {
  return (
    <colgroup>
      <col style={{ width: "15%" }} />
      <col style={{ width: "14%" }} />
      <col />
      <col style={{ width: "4.5rem" }} />
      <col style={{ width: "5.25rem" }} />
      <col style={{ width: "100px" }} />
    </colgroup>
  );
}

function FooterLinksSection({
  title,
  section,
  links,
  siteAppId,
  readOnly,
  onChange,
}: {
  title: string;
  section: SiteFooterLinkSection;
  links: SiteFooterLinkView[];
  siteAppId?: string;
  readOnly: boolean;
  onChange: (next: SiteFooterLinkView[]) => void;
}) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const mountedRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<FooterLinkFormValues>(() => emptyFooterLinkFormValues());
  const [editRow, setEditRow] = useState<SiteFooterLinkView | null>(null);
  const [editDraft, setEditDraft] = useState<FooterLinkFormValues>(() => emptyFooterLinkFormValues());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setEditRow(null);
    setAddOpen(false);
    setError(null);
  }, [siteAppId]);

  const scopedLinks = useMemo(() => {
    if (section !== "ON_THIS_SITE" || !siteAppId) return links;
    return links.filter((link) => matchesFooterSiteApp(link.siteAppId, siteAppId));
  }, [links, section, siteAppId]);

  function applyScopedChange(nextScoped: SiteFooterLinkView[]) {
    if (section !== "ON_THIS_SITE" || !siteAppId) {
      onChange(nextScoped);
      return;
    }
    const others = links.filter((link) => !matchesFooterSiteApp(link.siteAppId, siteAppId));
    onChange([...others, ...nextScoped]);
  }

  const rows = useMemo(() => sortLinks(scopedLinks), [scopedLinks]);
  const publishedCount = useMemo(() => rows.filter((row) => row.isPublished).length, [rows]);

  function closeEditPanel() {
    setEditRow(null);
    setError(null);
  }

  function openEditPanel(row: SiteFooterLinkView) {
    if (editRow?.id === row.id) {
      closeEditPanel();
      return;
    }
    setAddOpen(false);
    setEditRow(row);
    setEditDraft(footerLinkFormValuesFromRow(row));
    setError(null);
  }

  function openAddPanel() {
    closeEditPanel();
    setAddDraft(emptyFooterLinkFormValues());
    setAddOpen(true);
    setError(null);
  }

  async function createLink() {
    if (!addDraft.label.trim() || !addDraft.href.trim()) {
      setError("Label and href are required.");
      return;
    }
    if (section === "ON_THIS_SITE" && !siteAppId) {
      setError("Select an app site before adding links.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site/footer/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          ...(section === "ON_THIS_SITE" && siteAppId ? { siteAppId } : {}),
          label: addDraft.label.trim(),
          href: addDraft.href.trim(),
          description: addDraft.description.trim() || null,
          internalPath: addDraft.internalPath.trim() || null,
          isExternal: addDraft.isExternal,
          sortOrder: Number.parseInt(addDraft.sortOrder, 10) || 100,
          isPublished: addDraft.isPublished,
        }),
      });
      const data = await readJson<{ link: SiteFooterLinkView }>(res);
      if (!mountedRef.current) return;
      applyScopedChange([...scopedLinks, { ...data.link, siteAppId: data.link.siteAppId ?? siteAppId ?? null }]);
      setAddDraft(emptyFooterLinkFormValues());
      setAddOpen(false);
      toast.success("Link added");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not add link.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function saveEditLink() {
    if (!editRow) return;
    if (!editDraft.label.trim() || !editDraft.href.trim()) {
      setError("Label and href are required.");
      return;
    }
    if (section === "ON_THIS_SITE" && !siteAppId) {
      setError("Select an app site before saving links.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/site/footer/links?id=${encodeURIComponent(editRow.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(section === "ON_THIS_SITE" && siteAppId
              ? { siteAppId, expectedSiteAppId: siteAppId }
              : {}),
            label: editDraft.label.trim(),
            href: editDraft.href.trim(),
            description: editDraft.description.trim() || null,
            internalPath: editDraft.internalPath.trim() || null,
            isExternal: editDraft.isExternal,
            sortOrder: Number.parseInt(editDraft.sortOrder, 10) || 100,
            isPublished: editDraft.isPublished,
          }),
        },
      );
      const data = await readJson<{ link: SiteFooterLinkView }>(res);
      if (!mountedRef.current) return;
      const saved = { ...editRow, ...data.link, siteAppId: data.link.siteAppId ?? siteAppId ?? editRow.siteAppId };
      applyScopedChange(scopedLinks.map((link) => (link.id === editRow.id ? saved : link)));
      closeEditPanel();
      toast.success("Link saved");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not save link.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function deleteLink(row: SiteFooterLinkView) {
    if (!(await confirm(`Delete link "${row.label}"?`))) return;
    setBusyId(row.id);
    setError(null);
    try {
      const query = new URLSearchParams({ id: row.id });
      if (section === "ON_THIS_SITE" && siteAppId) {
        query.set("siteAppId", siteAppId);
      }
      const res = await fetch(`/api/admin/site/footer/links?${query.toString()}`, { method: "DELETE" });
      await readJson<{ ok: boolean }>(res);
      if (!mountedRef.current) return;
      if (editRow?.id === row.id) closeEditPanel();
      applyScopedChange(scopedLinks.filter((link) => link.id !== row.id));
      toast.success("Link deleted");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not delete link.");
    } finally {
      if (mountedRef.current) setBusyId(null);
    }
  }

  return (
    <>
      {editRow ? (
        <>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className={adminPageTitle}>Edit link</h1>
              <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>
                {title} · {editRow.label}
              </p>
            </div>
            <AdminFormPanelCloseButton variant="back" disabled={busy} onClick={closeEditPanel} />
          </div>
          <div className={`${adminPanel} mt-6`}>
            {error ? <p className="ds-admin-error-banner mb-4">{error}</p> : null}
            <div className={adminInlineFormBody}>
              <FooterLinkFormFields
                values={editDraft}
                disabled={busy}
                onChange={(patch) => setEditDraft((current) => ({ ...current, ...patch }))}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={closeEditPanel}>
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={busy} onClick={() => void saveEditLink()}>
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`${adminPanel} mt-3`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={adminSectionTitle}>{title}</h2>
                <span className={adminCountBadge}>{rows.length.toLocaleString()} links</span>
                <span className={adminCountBadge}>{publishedCount.toLocaleString()} published</span>
              </div>
              <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
                Footer navigation links shown under “{title}”.
              </p>
            </div>
            {!readOnly ? (
              <button
                type="button"
                className={addOpen ? adminToolbarBtnSecondary : adminToolbarBtnPrimary}
                disabled={busy}
                onClick={() => (addOpen ? setAddOpen(false) : openAddPanel())}
              >
                {addOpen ? "Close create form" : "Add link"}
              </button>
            ) : null}
          </div>

          {error ? <p className="ds-admin-error-banner mt-4">{error}</p> : null}

          {addOpen && !readOnly ? (
            <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
              <h2 className={adminSectionTitle}>Add link</h2>
              <FooterLinkFormFields
                className="mt-4"
                values={addDraft}
                disabled={busy}
                onChange={(patch) => setAddDraft((current) => ({ ...current, ...patch }))}
              />
              <div className="mt-4 flex justify-end">
                <Button type="button" size="sm" disabled={busy} onClick={() => void createLink()}>
                  Add link
                </Button>
              </div>
            </div>
          ) : null}

          <div className={adminPanelSectionDivider}>
            <div className={adminTableWrapInset}>
              <div className={adminTableScroll}>
                <table className={footerAdminTableClass}>
                  <FooterLinksColgroup />
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Href</th>
                      <th>Internal path</th>
                      <th>Order</th>
                      <th>Published</th>
                      <th className="is-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <AdminListEmptyState variant="table-row" colSpan={6} entityName="links" />
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id}>
                          <td className="font-medium text-[var(--ds-ink)]">{row.label}</td>
                          <td className="font-mono text-xs text-[var(--ds-body)]">{row.href}</td>
                          <td className="font-mono text-xs text-[var(--ds-body)]">{row.internalPath ?? "—"}</td>
                          <td className="is-muted">{row.sortOrder}</td>
                          <td className="is-muted">{row.isPublished ? "Yes" : "No"}</td>
                          <td className="is-actions">
                            {!readOnly ? (
                              <span className="inline-flex items-center gap-1">
                                <AdminEditIconButton
                                  aria-label={`Edit ${row.label}`}
                                  disabled={busy || busyId === row.id}
                                  onClick={() => openEditPanel(row)}
                                />
                                <AdminDeleteIconButton
                                  aria-label={`Delete ${row.label}`}
                                  disabled={busy || busyId === row.id}
                                  onClick={() => void deleteLink(row)}
                                />
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FooterSocialSection({
  links,
  readOnly,
  onChange,
}: {
  links: SiteFooterSocialLinkView[];
  readOnly: boolean;
  onChange: (next: SiteFooterSocialLinkView[]) => void;
}) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const mountedRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<FooterSocialFormValues>(() => emptyFooterSocialFormValues());
  const [editRow, setEditRow] = useState<SiteFooterSocialLinkView | null>(null);
  const [editDraft, setEditDraft] = useState<FooterSocialFormValues>(() => emptyFooterSocialFormValues());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const rows = useMemo(() => sortSocial(links), [links]);
  const publishedCount = useMemo(() => rows.filter((row) => row.isPublished).length, [rows]);

  function closeEditPanel() {
    setEditRow(null);
    setError(null);
  }

  function openEditPanel(row: SiteFooterSocialLinkView) {
    if (editRow?.id === row.id) {
      closeEditPanel();
      return;
    }
    setAddOpen(false);
    setEditRow(row);
    setEditDraft(footerSocialFormValuesFromRow(row));
    setError(null);
  }

  function openAddPanel() {
    closeEditPanel();
    setAddDraft(emptyFooterSocialFormValues());
    setAddOpen(true);
    setError(null);
  }

  async function createSocial() {
    if (!addDraft.label.trim() || !addDraft.url.trim()) {
      setError("Label and URL are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site/footer/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: addDraft.platform,
          label: addDraft.label.trim(),
          url: addDraft.url.trim(),
          sortOrder: Number.parseInt(addDraft.sortOrder, 10) || 100,
          isPublished: addDraft.isPublished,
        }),
      });
      const data = await readJson<{ social: SiteFooterSocialLinkView }>(res);
      if (!mountedRef.current) return;
      onChange([...links, data.social]);
      setAddDraft(emptyFooterSocialFormValues());
      setAddOpen(false);
      toast.success("Social link added");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not add social link.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function saveEditSocial() {
    if (!editRow) return;
    if (!editDraft.label.trim() || !editDraft.url.trim()) {
      setError("Label and URL are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site/footer/social/${editRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editDraft.platform,
          label: editDraft.label.trim(),
          url: editDraft.url.trim(),
          sortOrder: Number.parseInt(editDraft.sortOrder, 10) || 100,
          isPublished: editDraft.isPublished,
        }),
      });
      const data = await readJson<{ social: SiteFooterSocialLinkView }>(res);
      if (!mountedRef.current) return;
      onChange(links.map((row) => (row.id === editRow.id ? { ...row, ...data.social } : row)));
      closeEditPanel();
      toast.success("Social link saved");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not save social link.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function deleteSocial(row: SiteFooterSocialLinkView) {
    if (!(await confirm(`Delete social link "${row.label}"?`))) return;
    setBusyId(row.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site/footer/social/${row.id}`, { method: "DELETE" });
      await readJson<{ ok: boolean }>(res);
      if (!mountedRef.current) return;
      if (editRow?.id === row.id) closeEditPanel();
      onChange(links.filter((link) => link.id !== row.id));
      toast.success("Social link deleted");
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e instanceof Error ? e.message : "Could not delete social link.");
    } finally {
      if (mountedRef.current) setBusyId(null);
    }
  }

  return (
    <>
      {editRow ? (
        <>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className={adminPageTitle}>Edit social link</h1>
              <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>{editRow.label}</p>
            </div>
            <AdminFormPanelCloseButton variant="back" disabled={busy} onClick={closeEditPanel} />
          </div>
          <div className={`${adminPanel} mt-6`}>
            {error ? <p className="ds-admin-error-banner mb-4">{error}</p> : null}
            <div className={adminInlineFormBody}>
              <FooterSocialFormFields
                values={editDraft}
                disabled={busy}
                onChange={(patch) => setEditDraft((current) => ({ ...current, ...patch }))}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={closeEditPanel}>
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={busy} onClick={() => void saveEditSocial()}>
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`${adminPanel} mt-3`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={adminSectionTitle}>Social media</h2>
                <span className={adminCountBadge}>{rows.length.toLocaleString()} links</span>
                <span className={adminCountBadge}>{publishedCount.toLocaleString()} published</span>
              </div>
              <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
                Icons shown in the footer meta row on keyra.ie and connected sites.
              </p>
            </div>
            {!readOnly ? (
              <button
                type="button"
                className={addOpen ? adminToolbarBtnSecondary : adminToolbarBtnPrimary}
                disabled={busy}
                onClick={() => (addOpen ? setAddOpen(false) : openAddPanel())}
              >
                {addOpen ? "Close create form" : "Add social link"}
              </button>
            ) : null}
          </div>

          {error ? <p className="ds-admin-error-banner mt-4">{error}</p> : null}

          {addOpen && !readOnly ? (
            <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
              <h2 className={adminSectionTitle}>Add social link</h2>
              <FooterSocialFormFields
                className="mt-4"
                values={addDraft}
                disabled={busy}
                onChange={(patch) => setAddDraft((current) => ({ ...current, ...patch }))}
              />
              <div className="mt-4 flex justify-end">
                <Button type="button" size="sm" disabled={busy} onClick={() => void createSocial()}>
                  Add social link
                </Button>
              </div>
            </div>
          ) : null}

          <div className={adminPanelSectionDivider}>
            <div className={adminTableWrapInset}>
              <div className={adminTableScroll}>
                <table className={footerAdminTableClass}>
                  <FooterSocialColgroup />
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Label</th>
                      <th>URL</th>
                      <th>Order</th>
                      <th>Published</th>
                      <th className="is-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <AdminListEmptyState variant="table-row" colSpan={6} entityName="social links" />
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]">
                                <SocialPlatformIcon platform={row.platform} className="h-3.5 w-3.5 fill-current" />
                              </span>
                              <span className="truncate text-[var(--ds-ink)]">{row.platform}</span>
                            </span>
                          </td>
                          <td className="font-medium text-[var(--ds-ink)]">{row.label}</td>
                          <td className="font-mono text-xs text-[var(--ds-body)]">{row.url}</td>
                          <td className="is-muted">{row.sortOrder}</td>
                          <td className="is-muted">{row.isPublished ? "Yes" : "No"}</td>
                          <td className="is-actions">
                            {!readOnly ? (
                              <span className="inline-flex items-center gap-1">
                                <AdminEditIconButton
                                  aria-label={`Edit ${row.label}`}
                                  disabled={busy || busyId === row.id}
                                  onClick={() => openEditPanel(row)}
                                />
                                <AdminDeleteIconButton
                                  aria-label={`Delete ${row.label}`}
                                  disabled={busy || busyId === row.id}
                                  onClick={() => void deleteSocial(row)}
                                />
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type Props = {
  initialConfig: SiteFooterConfig;
  readOnly: boolean;
  footerSiteApps: FooterSiteAppOption[];
};

export function FooterManageClient({ initialConfig, readOnly, footerSiteApps }: Props) {
  const toast = useToast();
  const [config, setConfig] = useState(initialConfig);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FooterContentTab>("brand");
  const [selectedSiteAppId, setSelectedSiteAppId] = useState(
    () => footerSiteApps[0]?.id ?? SITE_FOOTER_MARKETING_APP_ID,
  );
  const mountedRef = useRef(false);

  const selectedSiteApp = useMemo(
    () => footerSiteApps.find((app) => app.id === selectedSiteAppId) ?? footerSiteApps[0] ?? null,
    [footerSiteApps, selectedSiteAppId],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Site links", value: String(config.onThisSiteLinks.length) },
      { label: "App links", value: String(config.keyraAppLinks.length) },
      { label: "Social", value: String(config.socialLinks.length) },
    ],
    [config.onThisSiteLinks.length, config.keyraAppLinks.length, config.socialLinks.length],
  );

  async function saveSettings() {
    setSettingsBusy(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/admin/site/footer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoSrc: config.settings.logoSrc,
          description: config.settings.description,
          onThisSiteLabel: config.settings.onThisSiteLabel,
          keyraAppsLabel: config.settings.keyraAppsLabel,
        }),
      });
      const data = await readJson<{ settings: SiteFooterConfig["settings"] }>(res);
      if (!mountedRef.current) return;
      setConfig((prev) => ({ ...prev, settings: { ...prev.settings, ...data.settings } }));
      toast.success("Footer settings saved");
    } catch (error) {
      if (!mountedRef.current) return;
      setSettingsError(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      if (mountedRef.current) setSettingsBusy(false);
    }
  }

  return (
    <div>
      <AdminCatalogHero
        title="Footer"
        description="Manage the Keyra footer on keyra.ie and connected marketing sites — brand copy, navigation links, app links, and social icons."
        stats={stats}
      />

      <FooterContentTabs
        activeTab={activeTab}
        onThisSiteLabel={config.settings.onThisSiteLabel}
        keyraAppsLabel={config.settings.keyraAppsLabel}
        onThisSiteCount={config.onThisSiteLinks.length}
        keyraAppsCount={config.keyraAppLinks.length}
        socialCount={config.socialLinks.length}
        onChange={setActiveTab}
      />

      {activeTab === "brand" ? (
        <div
          id="footer-section-brand"
          role="tabpanel"
          aria-labelledby="footer-tab-brand"
          className={`${adminPanel} mt-3`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className={adminSectionTitle}>Brand</h2>
              <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
                Logo, description, and section headings for the footer brand block.
              </p>
            </div>
            {!readOnly ? (
              <button
                type="button"
                className={adminToolbarBtnPrimary}
                disabled={settingsBusy}
                onClick={() => void saveSettings()}
              >
                Save brand settings
              </button>
            ) : null}
          </div>

          {settingsError ? <p className="ds-admin-error-banner mt-4">{settingsError}</p> : null}

          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_12rem]">
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <AdminFormField label="Logo URL" htmlFor="footer-logo-src" className="sm:col-span-2">
                  <input
                    id="footer-logo-src"
                    className={adminFormInput}
                    value={config.settings.logoSrc ?? ""}
                    disabled={readOnly || settingsBusy}
                    autoComplete="off"
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, logoSrc: event.target.value },
                      }))
                    }
                  />
                </AdminFormField>
                <AdminFormField label="Description" htmlFor="footer-description" className="sm:col-span-2">
                  <textarea
                    id="footer-description"
                    className={`${adminFormInput} min-h-[5.5rem] resize-y`}
                    rows={3}
                    value={config.settings.description}
                    disabled={readOnly || settingsBusy}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, description: event.target.value },
                      }))
                    }
                  />
                </AdminFormField>
                <AdminFormField label="“On this site” heading" htmlFor="footer-on-this-site-label">
                  <input
                    id="footer-on-this-site-label"
                    className={adminFormInput}
                    value={config.settings.onThisSiteLabel}
                    disabled={readOnly || settingsBusy}
                    autoComplete="off"
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, onThisSiteLabel: event.target.value },
                      }))
                    }
                  />
                </AdminFormField>
                <AdminFormField label="“Keyra apps” heading" htmlFor="footer-keyra-apps-label">
                  <input
                    id="footer-keyra-apps-label"
                    className={adminFormInput}
                    value={config.settings.keyraAppsLabel}
                    disabled={readOnly || settingsBusy}
                    autoComplete="off"
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, keyraAppsLabel: event.target.value },
                      }))
                    }
                  />
                </AdminFormField>
              </div>

              <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] p-4 lg:rounded-none lg:border-0 lg:border-l lg:border-[var(--ds-hairline-strong)] lg:bg-transparent lg:pl-6">
                <p className="ds-body-sm font-semibold text-[var(--ds-ink)]">Logo preview</p>
                <div className="relative mt-3 h-10 w-full">
                  {config.settings.logoSrc ? (
                    <Image
                      src={config.settings.logoSrc}
                      alt="Footer logo preview"
                      fill
                      className="object-contain object-left"
                      unoptimized
                    />
                  ) : (
                    <p className={`${adminBody} text-[var(--ds-body)]`}>No logo URL</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "on-this-site" ? (
        <div id="footer-section-on-this-site" role="tabpanel" aria-labelledby="footer-tab-on-this-site">
          <div className={`${adminPanel} mt-3`}>
            <AdminFormField label="App site" htmlFor="footer-on-this-site-app">
              <AdminSelectMenu
                id="footer-on-this-site-app"
                className="ds-footer-app-site-select"
                value={selectedSiteAppId}
                onChange={setSelectedSiteAppId}
                options={footerSiteApps.map((app) => ({
                  value: app.id,
                  label: app.label,
                }))}
                matchMenuWidth
                aria-label="Select app for On this site links"
              />
              {selectedSiteApp ? (
                <p className={`${adminBody} mt-1.5 font-mono text-xs text-[var(--ds-body)]`}>
                  {selectedSiteApp.href}
                </p>
              ) : null}
            </AdminFormField>
            <p className={`${adminBody} mt-3 max-w-xl text-[var(--ds-body)]`}>
              Manage footer navigation links shown under “{config.settings.onThisSiteLabel}” for the selected app.
            </p>
          </div>
          <FooterLinksSection
            title={config.settings.onThisSiteLabel}
            section="ON_THIS_SITE"
            siteAppId={selectedSiteAppId}
            links={config.onThisSiteLinks}
            readOnly={readOnly}
            onChange={(onThisSiteLinks) => setConfig((prev) => ({ ...prev, onThisSiteLinks }))}
          />
        </div>
      ) : null}

      {activeTab === "keyra-apps" ? (
        <div id="footer-section-keyra-apps" role="tabpanel" aria-labelledby="footer-tab-keyra-apps">
        <FooterLinksSection
          title={config.settings.keyraAppsLabel}
          section="KEYRA_APPS"
          links={config.keyraAppLinks}
          readOnly={readOnly}
          onChange={(keyraAppLinks) => setConfig((prev) => ({ ...prev, keyraAppLinks }))}
        />
        </div>
      ) : null}

      {activeTab === "social-media" ? (
        <div id="footer-section-social-media" role="tabpanel" aria-labelledby="footer-tab-social-media">
        <FooterSocialSection
          links={config.socialLinks}
          readOnly={readOnly}
          onChange={(socialLinks) => setConfig((prev) => ({ ...prev, socialLinks }))}
        />
        </div>
      ) : null}
    </div>
  );
}
