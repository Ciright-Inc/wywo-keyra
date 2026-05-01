import type {
  FamilyMemberPayload,
  FamilyRegistrationPayload,
  IndividualRegistrationPayload,
  OrganizationEmployeePayload,
  OrganizationRegistrationPayload,
  PartnerRegistrationPayload,
} from "@/lib/keyraRegistrationTypes";

const MAX_LEN = 2048;
const MAX_MESSAGE = 8000;

function trimStr(v: unknown, max = MAX_LEN): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function sanitizeIndividual(
  body: Record<string, unknown>,
): IndividualRegistrationPayload {
  return {
    registrationType: "INDIVIDUAL",
    subscriptionType: "KEYRA_INDIVIDUAL",
    firstName: trimStr(body.firstName, 120),
    lastName: trimStr(body.lastName, 120),
    countryOfCitizenship: trimStr(body.countryOfCitizenship, 4),
    countryOfResidence: trimStr(body.countryOfResidence, 4),
    mobileNumber: trimStr(body.mobileNumber, 24),
    email: trimStr(body.email, 254),
    deviceType: trimStr(body.deviceType, 64),
    authenticationMethod: "MOBILE_TELCO_VERIFICATION",
    source: "keyra.ie",
  };
}

function sanitizeSocialProfiles(raw: unknown): FamilyMemberPayload["socialProfiles"] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      platform: trimStr(r.platform, 80),
      handle: trimStr(r.handle, 200),
      profileUrl: trimStr(r.profileUrl, 500),
    };
  });
}

function sanitizeMembers(raw: unknown): FamilyMemberPayload[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 50).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      firstName: trimStr(r.firstName, 120),
      lastName: trimStr(r.lastName, 120),
      mobileNumber: trimStr(r.mobileNumber, 24),
      relationship: trimStr(r.relationship, 120),
      countryOfCitizenship: trimStr(r.countryOfCitizenship, 4),
      email: trimStr(r.email, 254),
      socialProfiles: sanitizeSocialProfiles(r.socialProfiles),
    };
  });
}

export function sanitizeFamily(body: Record<string, unknown>): FamilyRegistrationPayload {
  const protector = (body.familyDigitalProtector ?? {}) as Record<string, unknown>;
  return {
    registrationType: "FAMILY",
    subscriptionType: "KEYRA_FAMILY",
    familySurname: trimStr(body.familySurname, 160),
    countryOfCitizenship: trimStr(body.countryOfCitizenship, 4),
    countryOfResidence: trimStr(body.countryOfResidence, 4),
    familyDigitalProtector: {
      firstName: trimStr(protector.firstName, 120),
      lastName: trimStr(protector.lastName, 120),
      mobileNumber: trimStr(protector.mobileNumber, 24),
      email: trimStr(protector.email, 254),
    },
    familyMembers: sanitizeMembers(body.familyMembers),
    authenticationMethod: "MOBILE_TELCO_VERIFICATION",
    source: "keyra.ie",
  };
}

function sanitizeEmployees(raw: unknown): OrganizationEmployeePayload[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 500).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      firstName: trimStr(r.firstName, 120),
      lastName: trimStr(r.lastName, 120),
      title: trimStr(r.title, 160),
      department: trimStr(r.department, 160),
      workEmail: trimStr(r.workEmail, 254),
      mobileNumber: trimStr(r.mobileNumber, 24),
      country: trimStr(r.country, 4),
      roleType: trimStr(r.roleType, 80),
    };
  });
}

export function sanitizeOrganization(
  body: Record<string, unknown>,
): OrganizationRegistrationPayload {
  const leader = (body.securityLeader ?? {}) as Record<string, unknown>;
  let additionalDomains: string[] = [];
  const ad = body.additionalDomains;
  if (Array.isArray(ad)) {
    additionalDomains = ad
      .map((d) => trimStr(d, 253).toLowerCase())
      .filter(Boolean)
      .slice(0, 50);
  }
  return {
    registrationType: "ORGANIZATION",
    subscriptionType: "KEYRA_ORGANIZATION",
    organizationName: trimStr(body.organizationName, 300),
    countryOfRegistration: trimStr(body.countryOfRegistration, 4),
    countryOfPrimaryOperation: trimStr(body.countryOfPrimaryOperation, 4),
    organizationType: trimStr(body.organizationType, 120),
    mainDomain: trimStr(body.mainDomain, 253).toLowerCase(),
    additionalDomains,
    websiteUrl: trimStr(body.websiteUrl, 500),
    employeeCount: trimStr(body.employeeCount, 32),
    securityLeader: {
      firstName: trimStr(leader.firstName, 120),
      lastName: trimStr(leader.lastName, 120),
      title: trimStr(leader.title, 160),
      mobileNumber: trimStr(leader.mobileNumber, 24),
      email: trimStr(leader.email, 254),
    },
    employees: sanitizeEmployees(body.employees),
    authenticationMethod: "MOBILE_TELCO_VERIFICATION",
    source: "keyra.ie",
  };
}

export function sanitizePartner(body: Record<string, unknown>): PartnerRegistrationPayload {
  let regions: string[] = [];
  const cr = body.countriesRegionsOfInterest;
  if (Array.isArray(cr)) {
    regions = cr.map((s) => trimStr(s, 120)).filter(Boolean).slice(0, 80);
  } else if (typeof cr === "string") {
    regions = cr
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 80);
  }

  return {
    registrationType: "PARTNER",
    organizationName: trimStr(body.organizationName, 300),
    countryOfRegistration: trimStr(body.countryOfRegistration, 4),
    partnerType: trimStr(body.partnerType, 120),
    websiteDomain: trimStr(body.websiteDomain, 500),
    primaryContactName: trimStr(body.primaryContactName, 200),
    title: trimStr(body.title, 160),
    mobileNumber: trimStr(body.mobileNumber, 24),
    email: trimStr(body.email, 254),
    countriesRegionsOfInterest: regions,
    partnershipInterest: trimStr(body.partnershipInterest, 120),
    message: trimStr(body.message, MAX_MESSAGE),
    source: "keyra.ie",
  };
}
