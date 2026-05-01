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
import { combinePhoneParts, DEFAULT_PHONE_COUNTRY_DIAL } from "@/lib/phoneCountryOptions";
import { useEffect, useState } from "react";

type SocialRow = {
  key: string;
  platform: string;
  handle: string;
  profileUrl: string;
};

type MemberRow = {
  key: string;
  firstName: string;
  lastName: string;
  dial: string;
  national: string;
  relationship: string;
  countryCitizenship: string;
  email: string;
  socials: SocialRow[];
};

function newSocial(): SocialRow {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    platform: "",
    handle: "",
    profileUrl: "",
  };
}

function newMember(surname: string): MemberRow {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    firstName: "",
    lastName: surname.trim(),
    dial: DEFAULT_PHONE_COUNTRY_DIAL,
    national: "",
    relationship: "",
    countryCitizenship: "",
    email: "",
    socials: [],
  };
}

export function FamilyRegistrationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [stepForm, setStepForm] = useState<"form" | "success">("form");
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [tsReset, setTsReset] = useState(0);

  const [familySurname, setFamilySurname] = useState("");
  const [countryCitizenship, setCountryCitizenship] = useState("");
  const [countryResidence, setCountryResidence] = useState("");
  const [dpFirst, setDpFirst] = useState("");
  const [dpLast, setDpLast] = useState("");
  const dpPhone = useDefaultPhoneDial();
  const [dpNational, setDpNational] = useState("");
  const [dpEmail, setDpEmail] = useState("");

  const [members, setMembers] = useState<MemberRow[]>([]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setStepForm("form");
      setError(null);
      setPending(false);
      setHoneypot("");
      setTurnstileToken(null);
      setTsReset((x) => x + 1);
      setFamilySurname("");
      setCountryCitizenship("");
      setCountryResidence("");
      setDpFirst("");
      setDpLast("");
      setDpNational("");
      setDpEmail("");
      setMembers([]);
    }
  }, [open]);

  function goNext() {
    setError(null);
    if (
      !familySurname.trim() ||
      !countryCitizenship ||
      !countryResidence ||
      !dpFirst.trim() ||
      !dpLast.trim() ||
      !dpNational.trim() ||
      !dpEmail.trim()
    ) {
      setError("Complete all Family Core fields and Family Digital Protector details.");
      return;
    }
    if (members.length === 0) {
      setMembers([newMember(familySurname)]);
    }
    setStep(1);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const membersPayload = members.map((m) => ({
      firstName: m.firstName.trim(),
      lastName: m.lastName.trim(),
      mobileNumber: combinePhoneParts(m.dial, m.national),
      relationship: m.relationship.trim(),
      countryOfCitizenship: m.countryCitizenship,
      email: m.email.trim(),
      socialProfiles: m.socials
        .filter((s) => s.platform.trim() || s.handle.trim() || s.profileUrl.trim())
        .map((s) => ({
          platform: s.platform.trim(),
          handle: s.handle.trim(),
          profileUrl: s.profileUrl.trim(),
        })),
    }));

    const payload = {
      familySurname: familySurname.trim(),
      countryOfCitizenship: countryCitizenship,
      countryOfResidence: countryResidence,
      familyDigitalProtector: {
        firstName: dpFirst.trim(),
        lastName: dpLast.trim(),
        mobileNumber: combinePhoneParts(dpPhone.dial, dpNational),
        email: dpEmail.trim(),
      },
      familyMembers: membersPayload,
      _honeypot: honeypot,
      turnstileToken: turnstileToken ?? "",
    };

    setPending(true);
    try {
      const { message } = await postKeyraJson("/api/keyra/register/family", payload);
      setSuccessMsg(message);
      setStepForm("success");
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
      panelClassName="w-[min(96vw,720px)]"
      open={open}
      onClose={onClose}
      title="Protect Your Family"
      subtitle="Secure every family member’s identity, mobile device, and digital presence inside your own private Keyra Family Core."
      footer={
        stepForm === "success" ? null : step === 0 ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-keyra-border px-6 text-[15px] font-semibold text-keyra-text transition hover:border-keyra-primary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-7 text-[15px] font-semibold text-keyra-primary"
              onClick={goNext}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              className="h-12 rounded-[var(--keyra-radius-pill)] border border-keyra-border px-6 text-[15px] font-semibold text-keyra-text transition hover:border-keyra-primary"
              onClick={() => setStep(0)}
            >
              Back
            </button>
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
                form="keyra-family-form"
                disabled={pending}
                className="h-12 rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-7 text-[15px] font-semibold text-keyra-primary disabled:opacity-50"
              >
                {pending ? "Sending…" : "Create Family Core"}
              </button>
            </div>
          </div>
        )
      }
    >
      {stepForm === "success" ? (
        <SuccessPanel message={successMsg} onClose={onClose} />
      ) : step === 0 ? (
        <div className="space-y-5">
          <FormHoneypot value={honeypot} onChange={setHoneypot} />
          {error ? (
            <p className="text-[14px] font-medium text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div>
            <label htmlFor="kf-surname" className={regLabel}>
              Family surname *
            </label>
            <input
              id="kf-surname"
              value={familySurname}
              onChange={(e) => setFamilySurname(e.target.value)}
              required
              className={regField}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CountrySelect
              id="kf-cc"
              label="Country of citizenship"
              value={countryCitizenship}
              onChange={setCountryCitizenship}
              required
            />
            <CountrySelect
              id="kf-cr"
              label="Country of residence"
              value={countryResidence}
              onChange={setCountryResidence}
              required
            />
          </div>

          <div className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg p-5">
            <p className="text-[15px] font-semibold text-keyra-primary">
              Family Digital Protector
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-keyra-text-2">
              The Family Digital Protector is the person responsible for creating
              and managing the family’s secure Keyra identity registry.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="kf-dp-fn" className={regLabel}>
                  First name *
                </label>
                <input
                  id="kf-dp-fn"
                  value={dpFirst}
                  onChange={(e) => setDpFirst(e.target.value)}
                  required
                  className={regField}
                />
              </div>
              <div>
                <label htmlFor="kf-dp-ln" className={regLabel}>
                  Last name *
                </label>
                <input
                  id="kf-dp-ln"
                  value={dpLast}
                  onChange={(e) => setDpLast(e.target.value)}
                  required
                  className={regField}
                />
              </div>
            </div>
            <div className="mt-4">
              <PhoneInternationalRow
                idBase="kf-dp-m"
                label="Mobile number *"
                dialValue={dpPhone.dial}
                nationalValue={dpNational}
                onDialChange={dpPhone.setDial}
                onNationalChange={setDpNational}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="kf-dp-email" className={regLabel}>
                Email address *
              </label>
              <input
                id="kf-dp-email"
                type="email"
                value={dpEmail}
                onChange={(e) => setDpEmail(e.target.value)}
                required
                className={regField}
              />
              <p className="mt-2 text-[13px] text-keyra-text-2">
                Email is for coordination — mobile anchors verification per member.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <RegistrationFormShell id="keyra-family-form" onSubmit={onSubmit} error={error}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-[15px] font-semibold text-keyra-primary">
              Family members
            </p>
            <button
              type="button"
              className="rounded-[var(--keyra-radius-pill)] border border-keyra-border px-4 py-2 text-[13px] font-semibold text-keyra-text transition hover:border-keyra-primary"
              onClick={() => setMembers((m) => [...m, newMember(familySurname)])}
            >
              Add family member
            </button>
          </div>

          <div className="space-y-6 pt-2">
            {members.map((mem, idx) => (
              <div
                key={mem.key}
                className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold uppercase tracking-wider text-keyra-text-2">
                    Member {idx + 1}
                  </span>
                  <button
                    type="button"
                    className="text-[13px] font-medium text-red-400 hover:underline disabled:opacity-40"
                    disabled={members.length <= 1}
                    onClick={() =>
                      setMembers((prev) => prev.filter((x) => x.key !== mem.key))
                    }
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={regLabel}>First name *</label>
                    <input
                      className={regField}
                      value={mem.firstName}
                      onChange={(e) =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key ? { ...x, firstName: e.target.value } : x,
                          ),
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={regLabel}>Last name *</label>
                    <input
                      className={regField}
                      value={mem.lastName}
                      onChange={(e) =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key ? { ...x, lastName: e.target.value } : x,
                          ),
                        )
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <PhoneInternationalRow
                      idBase={`kf-m-${mem.key}`}
                      label="Mobile number *"
                      dialValue={mem.dial}
                      nationalValue={mem.national}
                      onDialChange={(d) =>
                        setMembers((prev) =>
                          prev.map((x) => (x.key === mem.key ? { ...x, dial: d } : x)),
                        )
                      }
                      onNationalChange={(n) =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key ? { ...x, national: n } : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={regLabel}>
                      Relationship to Family Digital Protector *
                    </label>
                    <input
                      className={regField}
                      value={mem.relationship}
                      onChange={(e) =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key ? { ...x, relationship: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="e.g. Child, Partner, Dependent"
                      required
                    />
                  </div>
                  <CountrySelect
                    id={`kf-mcc-${mem.key}`}
                    label="Country of citizenship"
                    value={mem.countryCitizenship}
                    onChange={(code) =>
                      setMembers((prev) =>
                        prev.map((x) =>
                          x.key === mem.key ? { ...x, countryCitizenship: code } : x,
                        ),
                      )
                    }
                    required
                  />
                  <div>
                    <label className={regLabel}>Optional email</label>
                    <input
                      type="email"
                      className={regField}
                      value={mem.email}
                      onChange={(e) =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key ? { ...x, email: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="mt-5 border-t border-keyra-border pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-keyra-text">
                      Social media profiles (optional)
                    </span>
                    <button
                      type="button"
                      className="text-[13px] font-semibold text-[var(--keyra-accent)] hover:underline"
                      onClick={() =>
                        setMembers((prev) =>
                          prev.map((x) =>
                            x.key === mem.key
                              ? { ...x, socials: [...x.socials, newSocial()] }
                              : x,
                          ),
                        )
                      }
                    >
                      Add profile
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {mem.socials.map((so) => (
                      <div
                        key={so.key}
                        className="grid grid-cols-1 gap-3 rounded-[var(--keyra-radius-card)] border border-keyra-border/80 bg-keyra-surface p-3 sm:grid-cols-3"
                      >
                        <input
                          className={regField}
                          placeholder="Platform"
                          value={so.platform}
                          onChange={(e) =>
                            setMembers((prev) =>
                              prev.map((x) =>
                                x.key === mem.key
                                  ? {
                                      ...x,
                                      socials: x.socials.map((s) =>
                                        s.key === so.key
                                          ? { ...s, platform: e.target.value }
                                          : s,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <input
                          className={regField}
                          placeholder="Username / handle"
                          value={so.handle}
                          onChange={(e) =>
                            setMembers((prev) =>
                              prev.map((x) =>
                                x.key === mem.key
                                  ? {
                                      ...x,
                                      socials: x.socials.map((s) =>
                                        s.key === so.key
                                          ? { ...s, handle: e.target.value }
                                          : s,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <div className="flex gap-2 sm:col-span-1">
                          <input
                            className={`${regField} min-w-0 flex-1`}
                            placeholder="Profile URL"
                            value={so.profileUrl}
                            onChange={(e) =>
                              setMembers((prev) =>
                                prev.map((x) =>
                                  x.key === mem.key
                                    ? {
                                        ...x,
                                        socials: x.socials.map((s) =>
                                          s.key === so.key
                                            ? { ...s, profileUrl: e.target.value }
                                            : s,
                                        ),
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                          <button
                            type="button"
                            className="shrink-0 rounded-lg border border-keyra-border px-2 text-[13px] text-red-400"
                            onClick={() =>
                              setMembers((prev) =>
                                prev.map((x) =>
                                  x.key === mem.key
                                    ? {
                                        ...x,
                                        socials: x.socials.filter((s) => s.key !== so.key),
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TurnstileMount resetSignal={tsReset} onToken={setTurnstileToken} />
        </RegistrationFormShell>
      )}
    </Modal>
  );
}
