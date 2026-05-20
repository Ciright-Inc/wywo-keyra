"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { DEPLOYMENT_APP_SECTIONS, type DeploymentAppView } from "@/lib/deploymentAppConstants";

type Props = {
  mode: "create" | "edit";
  app?: DeploymentAppView;
};

export function AppForm({ mode, app }: Props) {
  const router = useRouter();
  const [label, setLabel] = useState(app?.label ?? "");
  const [description, setDescription] = useState(app?.description ?? "");
  const [href, setHref] = useState(app?.href ?? "");
  const [section, setSection] = useState(app?.section ?? DEPLOYMENT_APP_SECTIONS[0]);
  const [isPrivate, setIsPrivate] = useState(app?.isPrivate ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint =
      mode === "edit" && app
        ? `/api/admin/deployments/apps/${encodeURIComponent(app.id)}`
        : "/api/admin/deployments/apps";
    const res = await fetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ label, description, href, section, isPrivate }),
    });

    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setSaving(false);

    if (!res.ok) {
      setError(data?.error ?? "Unable to save app.");
      return;
    }

    router.push("/admin/deployments/apps");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="block text-sm font-medium text-keyra-text-2">
        App name
        <input
          className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          placeholder="Example: Billing"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          required
        />
      </label>

      <label className="block text-sm font-medium text-keyra-text-2">
        Description
        <input
          className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          placeholder="Short app purpose"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </label>

      <label className="block text-sm font-medium text-keyra-text-2">
        Redirect URL
        <input
          className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          placeholder="https://example.keyra.ie"
          type="url"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          required
        />
      </label>

      <label className="block text-sm font-medium text-keyra-text-2">
        Section
        <select
          className="mt-2 h-11 w-full rounded-2xl border border-keyra-border bg-keyra-bg px-4 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
          value={section}
          onChange={(event) => setSection(event.target.value)}
        >
          {DEPLOYMENT_APP_SECTIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-keyra-border bg-keyra-bg px-4 py-3 text-sm text-keyra-text-2">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-keyra-border accent-keyra-primary"
          checked={isPrivate}
          onChange={(event) => setIsPrivate(event.target.checked)}
        />
        <span>
          <span className="block font-medium text-keyra-primary">Private app</span>
          <span className="mt-1 block text-xs leading-5">
            Hide this app from the 9-dot app launcher. It will still appear here in admin.
          </span>
        </span>
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--keyra-action)] px-4 py-2 text-sm font-medium text-keyra-primary ring-1 ring-[var(--keyra-action-border)] disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create app"}
        </button>
        <Link
          href="/admin/deployments/apps"
          className="rounded-full border border-keyra-border bg-keyra-bg px-4 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
