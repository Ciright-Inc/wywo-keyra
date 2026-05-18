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
import { KEYRA_DEVICE_TYPES } from "@/lib/keyraRegistrationConstants";
import { combinePhoneParts } from "@/lib/phoneCountryOptions";
import { useEffect, useState } from "react";

export function IndividualRegistrationModal({
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

  const [countryCitizenship, setCountryCitizenship] = useState("");
  const [countryResidence, setCountryResidence] = useState("");
  const { phoneCountryCode, setPhoneCountryCode, dial } = useDefaultPhoneDial();
  const [national, setNational] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("form");
      setError(null);
      setPending(false);
      setNational("");
      setCountryCitizenship("");
      setCountryResidence("");
      setHoneypot("");
      setTurnstileToken(null);
      setTsReset((x) => x + 1);
    }
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const mobileNumber = combinePhoneParts(dial, national);
    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      countryOfCitizenship: countryCitizenship,
      countryOfResidence: countryResidence,
      mobileNumber,
      email: String(fd.get("email") ?? "").trim(),
      deviceType: String(fd.get("deviceType") ?? "").trim(),
      consent: fd.get("consent") === "on",
      _honeypot: honeypot,
      turnstileToken: turnstileToken ?? "",
    };

    setPending(true);
    try {
      const { message } = await postKeyraJson(
        "/api/keyra/register/individual",
        payload,
      );
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
      open={open}
      onClose={onClose}
      title="Protect Your Identity"
      subtitle="Create your personal Keyra identity vault and secure your mobile device, identity, and digital presence."
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
              form="keyra-individual-form"
              disabled={pending}
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-7 text-[15px] font-semibold text-keyra-primary disabled:opacity-50"
            >
              {pending ? "Sending…" : "Submit"}
            </button>
          </div>
        )
      }
    >
      {step === "success" ? (
        <SuccessPanel message={successMsg} onClose={onClose} />
      ) : (
        <RegistrationFormShell
          id="keyra-individual-form"
          onSubmit={onSubmit}
          error={error}
        >
          <FormHoneypot value={honeypot} onChange={setHoneypot} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ki-fn" className={regLabel}>
                First name *
              </label>
              <input id="ki-fn" name="firstName" required className={regField} />
            </div>
            <div>
              <label htmlFor="ki-ln" className={regLabel}>
                Last name *
              </label>
              <input id="ki-ln" name="lastName" required className={regField} />
            </div>
          </div>

          <CountrySelect
            id="ki-citz"
            label="Country of citizenship"
            value={countryCitizenship}
            onChange={setCountryCitizenship}
            required
          />
          <CountrySelect
            id="ki-res"
            label="Country of residence"
            value={countryResidence}
            onChange={setCountryResidence}
            required
          />

          <PhoneInternationalRow
            idBase="ki-mob"
            label="Mobile number *"
            phoneCountryCode={phoneCountryCode}
            nationalValue={national}
            onPhoneCountryChange={setPhoneCountryCode}
            onNationalChange={setNational}
            hint="Include country code via the dropdown. Mobile verification is how Keyra anchors your identity."
          />

          <div>
            <label htmlFor="ki-email" className={regLabel}>
              Email address *
            </label>
            <input
              id="ki-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={regField}
            />
            <p className="mt-2 text-[13px] text-keyra-text-2">
              Used for updates only — mobile is the primary authentication channel.
            </p>
          </div>

          <div>
            <label htmlFor="ki-device" className={regLabel}>
              Primary device type *
            </label>
            <select
              id="ki-device"
              name="deviceType"
              required
              className={regField}
              defaultValue=""
            >
              <option value="" disabled>
                Select device
              </option>
              {KEYRA_DEVICE_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer gap-3 rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg p-4">
            <input
              name="consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 rounded border-keyra-border"
              required
            />
            <span className="text-[14px] leading-relaxed text-keyra-text-2">
              I agree to be contacted by Keyra and understand that mobile
              verification is required to secure my identity.
            </span>
          </label>

          <TurnstileMount resetSignal={tsReset} onToken={setTurnstileToken} />
        </RegistrationFormShell>
      )}
    </Modal>
  );
}
