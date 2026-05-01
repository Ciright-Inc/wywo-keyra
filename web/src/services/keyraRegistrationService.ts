/**
 * Maps Keyra onboarding payloads into Ciright Core customer / contact /
 * subscription / registry creates.
 *
 * TODO: Replace stub IDs with parsed Ciright Core responses when endpoints land.
 */

import type {
  FamilyRegistrationPayload,
  IndividualRegistrationPayload,
  OrganizationRegistrationPayload,
  PartnerRegistrationPayload,
} from "@/lib/keyraRegistrationTypes";
import {
  cirightCorePostJson,
  isCirightCoreConfigured,
} from "@/services/cirightCoreClient";
import { queueSmsVerification } from "@/services/smsVerificationService";

export type RegistrationResult = {
  customerId?: string;
  contactId?: string;
  familyRegistryId?: string;
  organizationRegistryId?: string;
  partnerLeadId?: string;
};

function previewIds(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
  return `${prefix}_${id}`;
}

export async function registerIndividual(
  payload: IndividualRegistrationPayload,
): Promise<RegistrationResult> {
  if (isCirightCoreConfigured()) {
    // TODO: Use real Ciright path, e.g. /v1/keyra/registrations/individual
    const res = await cirightCorePostJson("/v1/keyra/registrations/individual", payload);
    if (res.ok && res.data && typeof res.data === "object") {
      const d = res.data as Record<string, unknown>;
      const customerId = String(d.customerId ?? "").trim();
      const contactId = String(d.contactId ?? "").trim();
      if (customerId && contactId) {
        await queueSmsVerification({
          mobileE164: payload.mobileNumber,
          authenticationMethod: payload.authenticationMethod,
          context: "INDIVIDUAL",
          notifyEmail: payload.email,
        });
        return { customerId, contactId };
      }
    }
    throw new Error("CIRIGHT_CORE_REGISTRATION_FAILED");
  }

  await queueSmsVerification({
    mobileE164: payload.mobileNumber,
    authenticationMethod: payload.authenticationMethod,
    context: "INDIVIDUAL",
    notifyEmail: payload.email,
  });

  return {
    customerId: previewIds("cust"),
    contactId: previewIds("contact"),
  };
}

export async function registerFamily(
  payload: FamilyRegistrationPayload,
): Promise<RegistrationResult> {
  if (isCirightCoreConfigured()) {
    const res = await cirightCorePostJson("/v1/keyra/registrations/family", payload);
    if (res.ok && res.data && typeof res.data === "object") {
      const d = res.data as Record<string, unknown>;
      const customerId = String(d.customerId ?? "").trim();
      const familyRegistryId = String(d.familyRegistryId ?? "").trim();
      if (customerId && familyRegistryId) {
        await Promise.all([
          queueSmsVerification({
            mobileE164: payload.familyDigitalProtector.mobileNumber,
            authenticationMethod: payload.authenticationMethod,
            context: "FAMILY",
            notifyEmail: payload.familyDigitalProtector.email,
          }),
          ...payload.familyMembers.map((m) =>
            queueSmsVerification({
              mobileE164: m.mobileNumber,
              authenticationMethod: payload.authenticationMethod,
              context: "FAMILY_MEMBER",
              notifyEmail: m.email.trim() || undefined,
            }),
          ),
        ]);
        return { customerId, familyRegistryId };
      }
    }
    throw new Error("CIRIGHT_CORE_REGISTRATION_FAILED");
  }

  await Promise.all([
    queueSmsVerification({
      mobileE164: payload.familyDigitalProtector.mobileNumber,
      authenticationMethod: payload.authenticationMethod,
      context: "FAMILY",
      notifyEmail: payload.familyDigitalProtector.email,
    }),
    ...payload.familyMembers.map((m) =>
      queueSmsVerification({
        mobileE164: m.mobileNumber,
        authenticationMethod: payload.authenticationMethod,
        context: "FAMILY_MEMBER",
        notifyEmail: m.email.trim() || undefined,
      }),
    ),
  ]);

  return {
    customerId: previewIds("family_cust"),
    familyRegistryId: previewIds("family_reg"),
  };
}

export async function registerOrganization(
  payload: OrganizationRegistrationPayload,
): Promise<RegistrationResult> {
  if (isCirightCoreConfigured()) {
    const res = await cirightCorePostJson(
      "/v1/keyra/registrations/organization",
      payload,
    );
    if (res.ok && res.data && typeof res.data === "object") {
      const d = res.data as Record<string, unknown>;
      const customerId = String(d.customerId ?? "").trim();
      const organizationRegistryId = String(d.organizationRegistryId ?? "").trim();
      if (customerId && organizationRegistryId) {
        await Promise.all([
          queueSmsVerification({
            mobileE164: payload.securityLeader.mobileNumber,
            authenticationMethod: payload.authenticationMethod,
            context: "ORGANIZATION",
            notifyEmail: payload.securityLeader.email,
          }),
          ...payload.employees.map((emp) =>
            queueSmsVerification({
              mobileE164: emp.mobileNumber,
              authenticationMethod: payload.authenticationMethod,
              context: "ORGANIZATION_EMPLOYEE",
              notifyEmail: emp.workEmail,
            }),
          ),
        ]);
        return { customerId, organizationRegistryId };
      }
    }
    throw new Error("CIRIGHT_CORE_REGISTRATION_FAILED");
  }

  await Promise.all([
    queueSmsVerification({
      mobileE164: payload.securityLeader.mobileNumber,
      authenticationMethod: payload.authenticationMethod,
      context: "ORGANIZATION",
      notifyEmail: payload.securityLeader.email,
    }),
    ...payload.employees.map((emp) =>
      queueSmsVerification({
        mobileE164: emp.mobileNumber,
        authenticationMethod: payload.authenticationMethod,
        context: "ORGANIZATION_EMPLOYEE",
        notifyEmail: emp.workEmail,
      }),
    ),
  ]);

  return {
    customerId: previewIds("org_cust"),
    organizationRegistryId: previewIds("org_reg"),
  };
}

export async function registerPartner(
  payload: PartnerRegistrationPayload,
): Promise<RegistrationResult> {
  if (isCirightCoreConfigured()) {
    const res = await cirightCorePostJson("/v1/keyra/partner-leads", payload);
    if (res.ok && res.data && typeof res.data === "object") {
      const d = res.data as Record<string, unknown>;
      const partnerLeadId = String(d.partnerLeadId ?? "").trim();
      if (partnerLeadId) {
        await queueSmsVerification({
          mobileE164: payload.mobileNumber,
          authenticationMethod: "MOBILE_TELCO_VERIFICATION",
          context: "PARTNER",
          notifyEmail: payload.email,
        });
        return { partnerLeadId };
      }
    }
    throw new Error("CIRIGHT_CORE_REGISTRATION_FAILED");
  }

  await queueSmsVerification({
    mobileE164: payload.mobileNumber,
    authenticationMethod: "MOBILE_TELCO_VERIFICATION",
    context: "PARTNER",
    notifyEmail: payload.email,
  });

  return { partnerLeadId: previewIds("partner_lead") };
}
