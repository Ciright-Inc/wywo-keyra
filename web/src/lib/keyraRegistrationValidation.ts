import {
  KEYRA_DEVICE_TYPES,
  KEYRA_ORGANIZATION_TYPES,
  KEYRA_ORG_ROLE_TYPES,
  KEYRA_PARTNER_TYPES,
  KEYRA_PARTNERSHIP_INTERESTS,
} from "@/lib/keyraRegistrationConstants";
import type {
  FamilyRegistrationPayload,
  IndividualRegistrationPayload,
  OrganizationRegistrationPayload,
  PartnerRegistrationPayload,
} from "@/lib/keyraRegistrationTypes";

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Loose domain / hostname check for registration UX */
const DOMAIN_RE =
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_RE.test(email.trim());
}

export function isValidOptionalEmail(email: string): boolean {
  if (!email.trim()) return true;
  return isValidEmail(email);
}

export function isValidDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  if (!d || d.length > 253) return false;
  return DOMAIN_RE.test(d);
}

export function isValidIsoCountry(code: string): boolean {
  return /^[A-Z]{2}$/i.test(code.trim());
}

/** E.164-ish: leading + and reasonable digit count */
export function isValidMobileE164(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && mobile.trim().startsWith("+");
}

export function mobileFingerprint(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function collectDuplicateMobileKeys(mobiles: string[]): string[] {
  const seen = new Map<string, number>();
  const dups = new Set<string>();
  for (const m of mobiles) {
    const fp = mobileFingerprint(m);
    if (!fp) continue;
    const n = (seen.get(fp) ?? 0) + 1;
    seen.set(fp, n);
    if (n > 1) dups.add(fp);
  }
  return [...dups];
}

export function validateIndividual(
  p: IndividualRegistrationPayload,
  consent: boolean,
): string | null {
  if (!consent) return "Consent is required to continue.";
  if (!p.firstName || !p.lastName) return "First and last name are required.";
  if (!isValidIsoCountry(p.countryOfCitizenship))
    return "Select a valid country of citizenship.";
  if (!isValidIsoCountry(p.countryOfResidence))
    return "Select a valid country of residence.";
  if (!isValidMobileE164(p.mobileNumber))
    return "Enter a valid international mobile number including country code.";
  if (!isValidEmail(p.email)) return "Enter a valid email address.";
  const devices = KEYRA_DEVICE_TYPES.map((d) => d.value);
  if (!devices.includes(p.deviceType as (typeof KEYRA_DEVICE_TYPES)[number]["value"]))
    return "Select a primary device type.";
  return null;
}

export function validateFamily(p: FamilyRegistrationPayload): string | null {
  if (!p.familySurname.trim()) return "Family surname is required.";
  if (!isValidIsoCountry(p.countryOfCitizenship))
    return "Select a valid country of citizenship.";
  if (!isValidIsoCountry(p.countryOfResidence))
    return "Select a valid country of residence.";
  const dp = p.familyDigitalProtector;
  if (!dp.firstName || !dp.lastName) return "Family Digital Protector name is required.";
  if (!isValidMobileE164(dp.mobileNumber))
    return "Family Digital Protector mobile number is required.";
  if (!isValidEmail(dp.email)) return "Family Digital Protector email is required.";
  if (!p.familyMembers.length) return "Add at least one family member.";
  const mobiles: string[] = [dp.mobileNumber];
  for (const m of p.familyMembers) {
    if (!m.firstName.trim()) return "Each family member needs a first name.";
    if (!m.lastName.trim()) return "Each family member needs a last name.";
    if (!isValidMobileE164(m.mobileNumber))
      return "Each family member needs a valid mobile number.";
    if (!m.relationship.trim()) return "Relationship to the Family Digital Protector is required.";
    if (!isValidIsoCountry(m.countryOfCitizenship))
      return "Each family member needs a country of citizenship.";
    if (!isValidOptionalEmail(m.email))
      return "Optional emails must be valid when provided.";
    mobiles.push(m.mobileNumber);
  }
  if (collectDuplicateMobileKeys(mobiles).length)
    return "Each mobile number must be unique within this family registry.";
  return null;
}

export function validateOrganization(
  p: OrganizationRegistrationPayload,
): string | null {
  if (!p.organizationName.trim()) return "Organization name is required.";
  if (!isValidIsoCountry(p.countryOfRegistration))
    return "Select country of registration.";
  if (!isValidIsoCountry(p.countryOfPrimaryOperation))
    return "Select country of primary operation.";
  if (
    !(KEYRA_ORGANIZATION_TYPES as readonly string[]).includes(p.organizationType)
  )
    return "Select an organization type.";
  if (!isValidDomain(p.mainDomain)) return "Enter a valid primary domain.";
  if (p.websiteUrl.trim() && !/^https?:\/\//i.test(p.websiteUrl.trim()))
    return "Website URL should start with http:// or https://";
  if (!p.employeeCount.trim()) return "Enter approximate number of employees.";
  const sl = p.securityLeader;
  if (!sl.firstName || !sl.lastName || !sl.title.trim())
    return "Primary Security Leader details are required.";
  if (!isValidMobileE164(sl.mobileNumber))
    return "Primary Security Leader mobile is required.";
  if (!isValidEmail(sl.email)) return "Primary Security Leader email is required.";
  const mobiles = [sl.mobileNumber];
  for (const e of p.employees) {
    if (!e.firstName || !e.lastName) return "Each employee needs a first and last name.";
    if (!e.title.trim()) return "Each employee needs a title.";
    if (!e.department.trim()) return "Each employee needs a department.";
    if (!isValidEmail(e.workEmail)) return "Each employee needs a valid work email.";
    if (!isValidMobileE164(e.mobileNumber)) return "Each employee needs a valid mobile number.";
    if (!isValidIsoCountry(e.country)) return "Each employee needs a country.";
    if (!(KEYRA_ORG_ROLE_TYPES as readonly string[]).includes(e.roleType))
      return "Select a role type for each employee.";
    mobiles.push(e.mobileNumber);
  }
  if (collectDuplicateMobileKeys(mobiles).length)
    return "Each mobile number must be unique within this registration.";
  for (const d of p.additionalDomains) {
    if (d && !isValidDomain(d)) return "Additional domains must be valid.";
  }
  return null;
}

export function validatePartner(
  p: PartnerRegistrationPayload,
  consent: boolean,
): string | null {
  if (!consent) return "Consent is required to continue.";
  if (!p.organizationName.trim()) return "Company or organization name is required.";
  if (!isValidIsoCountry(p.countryOfRegistration))
    return "Select country of registration.";
  if (!(KEYRA_PARTNER_TYPES as readonly string[]).includes(p.partnerType))
    return "Select a partner type.";
  if (!p.websiteDomain.trim()) return "Website or domain is required.";
  if (!p.primaryContactName.trim()) return "Primary contact name is required.";
  if (!p.title.trim()) return "Title is required.";
  if (!isValidMobileE164(p.mobileNumber)) return "Valid mobile number is required.";
  if (!isValidEmail(p.email)) return "Valid email is required.";
  if (!p.countriesRegionsOfInterest.length)
    return "Enter at least one country or region of interest.";
  if (
    !(KEYRA_PARTNERSHIP_INTERESTS as readonly string[]).includes(p.partnershipInterest)
  )
    return "Select a partnership interest.";
  return null;
}
