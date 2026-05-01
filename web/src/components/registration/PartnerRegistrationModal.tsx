"use client";

import { postKeyraJson } from "@/components/registration/postKeyraJson";
import {
  CountrySelect,
  FormHoneypot,
  PhoneInternationalRow,
  RegistrationFormShell,
  SuccessPanel,
  TurnstileMount,
  regField,
  regLabel,
} from "@/components/registration/registrationPrimitives";
import { useDefaultPhoneDial } from "@/components/registration/useDefaultPhoneDial";
import { Modal } from "@/components/ui/Modal";
import {
  KEYRA_PARTNER_TYPES,
  KEYRA_PARTNERSHIP_INTERESTS,
} from "@/lib/keyraRegistrationConstants";
import { combinePhoneParts } from "@/lib/phoneCountryOptions";
import { useEffect, useState } from "react";

export function PartnerRegistrationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [tsReset, setTsReset] = useState(0);

  const [countryReg, setCountryReg] = useState("");
  const { dial, setDial } = useDefaultPhoneDial();
  const [national, setNational] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("form");
      setError(null);
      setPending(false);
      setNational("");
      setCountryReg("");
      setHoneypot("");
      setTurnstileToken(null);
      setTsReset((x) => x + 1);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const regionsRaw = String(fd.get("regions") ?? "");
    const countriesRegionsOfInterest = regionsRaw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      organizationName: String(fd.get("organizationName") ?? "").trim(),
      countryOfRegistration: countryReg,
      partnerType: String(fd.get("partnerType") ?? "").trim(),
      websiteDomain: String(fd.get("websiteDomain") ?? "").trim(),
      primaryContactName: String(fd.get("primaryContactName") ?? "").trim(),
      title: String(fd.get("title") ?? "").trim(),
      mobileNumber: combinePhoneParts(dial, national),
      email: String(fd.get("email") ?? "").trim(),
      countriesRegionsOfInterest,
      partnershipInterest: String(fd.get("partnershipInterest") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      consent: fd.get("consent") === "on",
      _honeypot: honeypot,
      turnstileToken: turnstileToken ?? "",
    };

    setPending(true);
    try {
      const { message } = await postKeyraJson("/api/keyra/register/partner", payload);
      setSuccessMsg(message);
      setStep("success");
      setTsReset((x) => x + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      layout="sheet"
      panelClassName="w-[min(94vw,640px)]"
      open={open}
      onClose={onClose}
      title="Partner With Keyra"
      subtitle="Work with Keyra to deliver trusted identity infrastructure across telecom, government, enterprise, financial, and digital ecosystems."
      footer={
        step === "success" ? null : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-keyra-border px-6 text-[15px] font-semibold text-keyra-text transition hover:border-keyra-primary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="keyra-partner-form"
              disabled={pending}
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-7 text-[15px] font-semibold text-keyra-primary disabled:opacity-50"
            >
              {pending ? "Sending…" : "Submit inquiry"}
            </button>
          </div>
        )
      }
    >
      {step === "success" ? (
        <SuccessPanel message={successMsg} onClose={onClose} />
      ) : (
        <RegistrationFormShell id="keyra-partner-form" onSubmit={onSubmit} error={error}>
          <FormHoneypot value={honeypot} onChange={setHoneypot} />

          <div>
            <label htmlFor="kp-org" className={regLabel}>
              Company / organization name *
            </label>
            <input id="kp-org" name="organizationName" required className={regField} />
          </div>

          <CountrySelect
            id="kp-country"
            label="Country of registration"
            value={countryReg}
            onChange={setCountryReg}
            required
          />

          <div>
            <label htmlFor="kp-type" className={regLabel}>
              Partner type *
            </label>
            <select id="kp-type" name="partnerType" required className={regField} defaultValue="">
              <option value="" disabled>
                Select partner type
              </option>
              {KEYRA_PARTNER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="kp-web" className={regLabel}>
              Website / domain *
            </label>
            <input id="kp-web" name="websiteDomain" required className={regField} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="kp-pc" className={regLabel}>
                Primary contact name *
              </label>
              <input id="kp-pc" name="primaryContactName" required className={regField} />
            </div>
            <div>
              <label htmlFor="kp-title" className={regLabel}>
                Title *
              </label>
              <input id="kp-title" name="title" required className={regField} />
            </div>
          </div>

          <PhoneInternationalRow
            idBase="kp-mob"
            label="Mobile number *"
            dialValue={dial}
            nationalValue={national}
            onDialChange={setDial}
            onNationalChange={setNational}
          />

          <div>
            <label htmlFor="kp-email" className={regLabel}>
              Email address *
            </label>
            <input
              id="kp-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={regField}
            />
          </div>

          <div>
            <label htmlFor="kp-regions" className={regLabel}>
              Countries / regions of interest *
            </label>
            <textarea
              id="kp-regions"
              name="regions"
              rows={3}
              required
              placeholder="e.g. Ireland, EU, North America — comma or newline separated"
              className={regField}
            />
          </div>

          <div>
            <label htmlFor="kp-interest" className={regLabel}>
              Partnership interest *
            </label>
            <select
              id="kp-interest"
              name="partnershipInterest"
              required
              className={regField}
              defaultValue=""
            >
              <option value="" disabled>
                Select interest
              </option>
              {KEYRA_PARTNERSHIP_INTERESTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="kp-msg" className={regLabel}>
              Message
            </label>
            <textarea id="kp-msg" name="message" rows={4} className={regField} />
          </div>

          <label className="flex cursor-pointer gap-3 rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg p-4">
            <input
              name="consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 rounded border-keyra-border"
              required
            />
            <span className="text-[14px] leading-relaxed text-keyra-text-2">
              I agree to be contacted by Keyra about partnership opportunities.
            </span>
          </label>

          <TurnstileMount resetSignal={tsReset} onToken={setTurnstileToken} />
        </RegistrationFormShell>
      )}
    </Modal>
  );
}
