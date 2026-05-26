"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { KeyraWywoWorld } from "@prisma/client";
import {
  adminError,
  adminFormGrid,
  adminFormStack,
  adminInput,
  adminLabel,
  adminToolbarBtnPrimary,
} from "@/lib/admin/adminUiClasses";
import { WywoSelect } from "./WywoSelect";

type Props = {
  initial: KeyraWywoWorld;
};

const DEVICES = ["desktop", "iPad", "tablet", "iPhone", "Android"] as const;

export function WywoOnboardingForm({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name?.trim() || "");
  const [company, setCompany] = useState(initial.company ?? "");
  const [role, setRole] = useState(initial.role ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [preferredDevice, setPreferredDevice] = useState(initial.preferredDevice ?? "");
  const [subscriptionId, setSubscriptionId] = useState(initial.subscriptionId ?? "");
  const [eid, setEid] = useState(initial.eid ?? "");
  const [uid, setUid] = useState(initial.ownerUid ?? "");

  const rules =
    (initial.notificationRulesJson as Record<string, unknown> | null) ?? {};
  const [smsAlerts, setSmsAlerts] = useState(rules.sms === true);
  const [emailAlerts, setEmailAlerts] = useState(rules.email === true);
  const [pushAlerts, setPushAlerts] = useState(rules.push === true);
  const [afterHoursOnlyTrusted, setAfterHoursOnlyTrusted] = useState(
    rules.afterHoursOnlyTrusted === true,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/wywo/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          role,
          country,
          preferredDevice,
          subscriptionId: subscriptionId || null,
          eid: eid || null,
          uid: uid || null,
          notificationRules: {
            sms: smsAlerts,
            email: emailAlerts,
            push: pushAlerts,
            afterHoursOnlyTrusted,
          },
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={adminFormStack}>
      <div className={adminFormGrid}>
        <div>
          <label className={adminLabel}>Display name</label>
          <input
            className={adminInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Company</label>
          <input
            className={adminInput}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel}>Role</label>
          <input
            className={adminInput}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel}>Country</label>
          <input
            className={adminInput}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel}>Preferred device</label>
          <WywoSelect
            value={preferredDevice}
            onChange={setPreferredDevice}
            placeholder="— select —"
            options={DEVICES.map((d) => ({ value: d, label: d }))}
          />
        </div>
        <div className="sm:col-span-2 grid sm:grid-cols-3 gap-3">
          <div>
            <label className={adminLabel}>Ciright subscription_id</label>
            <input
              className={adminInput}
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
            />
          </div>
          <div>
            <label className={adminLabel}>Ciright eid</label>
            <input
              className={adminInput}
              value={eid}
              onChange={(e) => setEid(e.target.value)}
            />
          </div>
          <div>
            <label className={adminLabel}>Ciright uid</label>
            <input
              className={adminInput}
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="sm:col-span-2 border border-[var(--ds-hairline)] rounded-[var(--ds-radius-md)] p-4">
          <legend className="ds-caption uppercase px-2">Notification rules</legend>
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="ds-body-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
              />
              SMS alerts
            </label>
            <label className="ds-body-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              Email alerts
            </label>
            <label className="ds-body-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
              />
              Push notifications
            </label>
            <label className="ds-body-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={afterHoursOnlyTrusted}
                onChange={(e) => setAfterHoursOnlyTrusted(e.target.checked)}
              />
              After-hours: trusted only
            </label>
          </div>
        </fieldset>
      </div>

      {error ? <p className={adminError}>{error}</p> : null}
      {saved ? (
        <p className="ds-body-sm text-[var(--ds-ink)]">World updated.</p>
      ) : null}

      <div>
        <button type="submit" className={adminToolbarBtnPrimary} disabled={submitting}>
          {submitting ? "Saving…" : "Save world"}
        </button>
      </div>

      <div className="ds-feature-card is-dashboard p-4">
        <h3 className="ds-title-sm">Your Keyra world id</h3>
        <p className="mt-2 ds-caption text-[var(--ds-body)]">
          Stable Ciright-compatible world identifier:
        </p>
        <p className="mt-1 font-mono text-[var(--ds-ink)] break-all">{initial.worldId}</p>
      </div>
    </form>
  );
}
