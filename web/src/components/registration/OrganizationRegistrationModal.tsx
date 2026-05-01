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
  KEYRA_ORGANIZATION_TYPES,
  KEYRA_ORG_ROLE_TYPES,
} from "@/lib/keyraRegistrationConstants";
import { combinePhoneParts, DEFAULT_PHONE_COUNTRY_DIAL } from "@/lib/phoneCountryOptions";
import { useEffect, useState } from "react";

type EmployeeRow = {
  key: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  workEmail: string;
  dial: string;
  national: string;
  country: string;
  roleType: string;
};

function emptyEmployee(): EmployeeRow {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    firstName: "",
    lastName: "",
    title: "",
    department: "",
    workEmail: "",
    dial: DEFAULT_PHONE_COUNTRY_DIAL,
    national: "",
    country: "",
    roleType: "",
  };
}

export function OrganizationRegistrationModal({
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

  const [orgName, setOrgName] = useState("");
  const [countryReg, setCountryReg] = useState("");
  const [countryOp, setCountryOp] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [mainDomain, setMainDomain] = useState("");
  const [additionalDomainsText, setAdditionalDomainsText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [domainNote, setDomainNote] = useState<string | null>(null);

  const [slFirst, setSlFirst] = useState("");
  const [slLast, setSlLast] = useState("");
  const [slTitle, setSlTitle] = useState("");
  const { dial: slDial, setDial: setSlDial } = useDefaultPhoneDial();
  const [slNational, setSlNational] = useState("");
  const [slEmail, setSlEmail] = useState("");

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setStepForm("form");
      setError(null);
      setPending(false);
      setHoneypot("");
      setTurnstileToken(null);
      setTsReset((x) => x + 1);
      setOrgName("");
      setCountryReg("");
      setCountryOp("");
      setOrganizationType("");
      setMainDomain("");
      setAdditionalDomainsText("");
      setWebsiteUrl("");
      setEmployeeCount("");
      setDomainNote(null);
      setSlFirst("");
      setSlLast("");
      setSlTitle("");
      setSlNational("");
      setSlEmail("");
      setSlDial(DEFAULT_PHONE_COUNTRY_DIAL);
      setEmployees([]);
    }
  }, [open, setSlDial]);

  async function onMainDomainBlur() {
    const d = mainDomain.trim().toLowerCase();
    setDomainNote(null);
    if (!d || !d.includes(".")) return;
    try {
      const res = await fetch("/api/keyra/domain/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });
      const data = (await res.json()) as { existsInCore?: boolean };
      if (data.existsInCore) {
        setDomainNote(
          "This domain may already be registered. Our team will verify ownership before activation.",
        );
      }
    } catch {
      /* ignore — non-blocking UX hint */
    }
  }

  function goNext() {
    setError(null);
    if (
      !orgName.trim() ||
      !countryReg ||
      !countryOp ||
      !organizationType ||
      !mainDomain.trim() ||
      !employeeCount.trim()
    ) {
      setError("Complete all required organization fields to continue.");
      return;
    }
    setStep(1);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const additionalDomains = additionalDomainsText
      .split(/[\n,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const employeesPayload = employees.map((emp) => ({
      firstName: emp.firstName.trim(),
      lastName: emp.lastName.trim(),
      title: emp.title.trim(),
      department: emp.department.trim(),
      workEmail: emp.workEmail.trim(),
      mobileNumber: combinePhoneParts(emp.dial, emp.national),
      country: emp.country,
      roleType: emp.roleType,
    }));

    const payload = {
      organizationName: orgName.trim(),
      countryOfRegistration: countryReg,
      countryOfPrimaryOperation: countryOp,
      organizationType,
      mainDomain: mainDomain.trim().toLowerCase(),
      additionalDomains,
      websiteUrl: websiteUrl.trim(),
      employeeCount: employeeCount.trim(),
      securityLeader: {
        firstName: slFirst.trim(),
        lastName: slLast.trim(),
        title: slTitle.trim(),
        mobileNumber: combinePhoneParts(slDial, slNational),
        email: slEmail.trim(),
      },
      employees: employeesPayload,
      _honeypot: honeypot,
      turnstileToken: turnstileToken ?? "",
    };

    setPending(true);
    try {
      const { message } = await postKeyraJson(
        "/api/keyra/register/organization",
        payload,
      );
      setSuccessMsg(message);
      setStepForm("success");
      setTsReset((x) => x + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const mobileTrustCopy =
    "Mobile numbers are used for secure validation through the telecom network. Email is collected for communication, but it is not treated as the primary authentication authority.";

  return (
    <Modal
      layout="sheet"
      panelClassName="w-[min(96vw,720px)]"
      open={open}
      onClose={onClose}
      title="Secure Your Organization"
      subtitle="Register your organization with Keyra to secure your domains, employees, mobile numbers, and trusted digital access."
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
                form="keyra-org-form"
                disabled={pending}
                className="h-12 rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-7 text-[15px] font-semibold text-keyra-primary disabled:opacity-50"
              >
                {pending ? "Sending…" : "Submit registration"}
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
            <label htmlFor="ko-name" className={regLabel}>
              Company / organization name *
            </label>
            <input
              id="ko-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className={regField}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <CountrySelect
              id="ko-cr"
              label="Country of registration"
              value={countryReg}
              onChange={setCountryReg}
              required
            />
            <CountrySelect
              id="ko-co"
              label="Country of primary operation"
              value={countryOp}
              onChange={setCountryOp}
              required
            />
          </div>

          <div>
            <label htmlFor="ko-type" className={regLabel}>
              Organization type *
            </label>
            <select
              id="ko-type"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              required
              className={regField}
            >
              <option value="">Select type</option>
              {KEYRA_ORGANIZATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ko-domain" className={regLabel}>
              Main company domain *
            </label>
            <input
              id="ko-domain"
              value={mainDomain}
              onChange={(e) => setMainDomain(e.target.value)}
              onBlur={onMainDomainBlur}
              placeholder="example.com"
              required
              className={regField}
            />
            {domainNote ? (
              <p className="mt-2 text-[13px] leading-relaxed text-amber-200/90">
                {domainNote}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="ko-add-dom" className={regLabel}>
              Additional domains
            </label>
            <textarea
              id="ko-add-dom"
              value={additionalDomainsText}
              onChange={(e) => setAdditionalDomainsText(e.target.value)}
              rows={3}
              placeholder="One domain per line"
              className={regField}
            />
          </div>

          <div>
            <label htmlFor="ko-web" className={regLabel}>
              Website URL
            </label>
            <input
              id="ko-web"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://"
              className={regField}
            />
          </div>

          <div>
            <label htmlFor="ko-ec" className={regLabel}>
              Number of employees *
            </label>
            <input
              id="ko-ec"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              inputMode="numeric"
              placeholder="Approximate headcount"
              required
              className={regField}
            />
          </div>
        </div>
      ) : (
        <RegistrationFormShell id="keyra-org-form" onSubmit={onSubmit} error={error}>
          <p className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-4 py-3 text-[13px] leading-relaxed text-keyra-text-2">
            {mobileTrustCopy}
          </p>

          <div className="border-t border-keyra-border pt-5">
            <p className="text-[15px] font-semibold text-keyra-primary">
              Primary Security Leader
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ko-sl-fn" className={regLabel}>
                  First name *
                </label>
                <input
                  id="ko-sl-fn"
                  value={slFirst}
                  onChange={(e) => setSlFirst(e.target.value)}
                  required
                  className={regField}
                />
              </div>
              <div>
                <label htmlFor="ko-sl-ln" className={regLabel}>
                  Last name *
                </label>
                <input
                  id="ko-sl-ln"
                  value={slLast}
                  onChange={(e) => setSlLast(e.target.value)}
                  required
                  className={regField}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="ko-sl-title" className={regLabel}>
                Title *
              </label>
              <input
                id="ko-sl-title"
                value={slTitle}
                onChange={(e) => setSlTitle(e.target.value)}
                required
                className={regField}
              />
            </div>
            <div className="mt-4">
              <PhoneInternationalRow
                idBase="ko-sl-m"
                label="Mobile number *"
                dialValue={slDial}
                nationalValue={slNational}
                onDialChange={setSlDial}
                onNationalChange={setSlNational}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="ko-sl-email" className={regLabel}>
                Email address *
              </label>
              <input
                id="ko-sl-email"
                type="email"
                value={slEmail}
                onChange={(e) => setSlEmail(e.target.value)}
                required
                className={regField}
              />
            </div>
          </div>

          <div className="border-t border-keyra-border pt-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-[15px] font-semibold text-keyra-primary">
                Employees / contacts
              </p>
              <button
                type="button"
                className="rounded-[var(--keyra-radius-pill)] border border-keyra-border px-4 py-2 text-[13px] font-semibold text-keyra-text transition hover:border-keyra-primary"
                onClick={() => setEmployees((prev) => [...prev, emptyEmployee()])}
              >
                Add employee
              </button>
            </div>
            <p className="mt-2 text-[13px] text-keyra-text-2">
              Optional — add key contacts you want secured under this registration.
            </p>

            <div className="mt-5 space-y-6">
              {employees.map((emp, idx) => (
                <div
                  key={emp.key}
                  className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold uppercase tracking-wider text-keyra-text-2">
                      Employee {idx + 1}
                    </span>
                    <button
                      type="button"
                      className="text-[13px] font-medium text-red-400 hover:underline"
                      onClick={() =>
                        setEmployees((prev) => prev.filter((e) => e.key !== emp.key))
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
                        value={emp.firstName}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, firstName: e.target.value } : x,
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
                        value={emp.lastName}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, lastName: e.target.value } : x,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={regLabel}>Title *</label>
                      <input
                        className={regField}
                        value={emp.title}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, title: e.target.value } : x,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={regLabel}>Department *</label>
                      <input
                        className={regField}
                        value={emp.department}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, department: e.target.value } : x,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={regLabel}>Work email *</label>
                      <input
                        type="email"
                        className={regField}
                        value={emp.workEmail}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, workEmail: e.target.value } : x,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <PhoneInternationalRow
                        idBase={`ko-em-${emp.key}`}
                        label="Mobile number *"
                        dialValue={emp.dial}
                        nationalValue={emp.national}
                        onDialChange={(d) =>
                          setEmployees((prev) =>
                            prev.map((x) => (x.key === emp.key ? { ...x, dial: d } : x)),
                          )
                        }
                        onNationalChange={(n) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, national: n } : x,
                            ),
                          )
                        }
                      />
                    </div>
                    <CountrySelect
                      id={`ko-em-c-${emp.key}`}
                      label="Country"
                      value={emp.country}
                      onChange={(code) =>
                        setEmployees((prev) =>
                          prev.map((x) =>
                            x.key === emp.key ? { ...x, country: code } : x,
                          ),
                        )
                      }
                      required
                    />
                    <div>
                      <label className={regLabel}>Role type *</label>
                      <select
                        className={regField}
                        value={emp.roleType}
                        onChange={(e) =>
                          setEmployees((prev) =>
                            prev.map((x) =>
                              x.key === emp.key ? { ...x, roleType: e.target.value } : x,
                            ),
                          )
                        }
                        required
                      >
                        <option value="">Select role</option>
                        {KEYRA_ORG_ROLE_TYPES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TurnstileMount resetSignal={tsReset} onToken={setTurnstileToken} />
        </RegistrationFormShell>
      )}
    </Modal>
  );
}
