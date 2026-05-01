/** Keyra onboarding payloads — frontend ↔ Keyra API routes only. */

export type KeyraRegistrationSource = "keyra.ie";

export type KeyraAuthenticationMethod = "MOBILE_TELCO_VERIFICATION";

export interface IndividualRegistrationPayload {
  registrationType: "INDIVIDUAL";
  subscriptionType: "KEYRA_INDIVIDUAL";
  firstName: string;
  lastName: string;
  countryOfCitizenship: string;
  countryOfResidence: string;
  mobileNumber: string;
  email: string;
  deviceType: string;
  authenticationMethod: KeyraAuthenticationMethod;
  source: KeyraRegistrationSource;
}

export interface FamilyDigitalProtectorPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
}

export interface FamilySocialProfilePayload {
  platform: string;
  handle: string;
  profileUrl: string;
}

export interface FamilyMemberPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  relationship: string;
  countryOfCitizenship: string;
  email: string;
  socialProfiles: FamilySocialProfilePayload[];
}

export interface FamilyRegistrationPayload {
  registrationType: "FAMILY";
  subscriptionType: "KEYRA_FAMILY";
  familySurname: string;
  countryOfCitizenship: string;
  countryOfResidence: string;
  familyDigitalProtector: FamilyDigitalProtectorPayload;
  familyMembers: FamilyMemberPayload[];
  authenticationMethod: KeyraAuthenticationMethod;
  source: KeyraRegistrationSource;
}

export interface OrganizationSecurityLeaderPayload {
  firstName: string;
  lastName: string;
  title: string;
  mobileNumber: string;
  email: string;
}

export interface OrganizationEmployeePayload {
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  workEmail: string;
  mobileNumber: string;
  country: string;
  roleType: string;
}

export interface OrganizationRegistrationPayload {
  registrationType: "ORGANIZATION";
  subscriptionType: "KEYRA_ORGANIZATION";
  organizationName: string;
  countryOfRegistration: string;
  countryOfPrimaryOperation: string;
  organizationType: string;
  mainDomain: string;
  additionalDomains: string[];
  websiteUrl: string;
  employeeCount: string;
  securityLeader: OrganizationSecurityLeaderPayload;
  employees: OrganizationEmployeePayload[];
  authenticationMethod: KeyraAuthenticationMethod;
  source: KeyraRegistrationSource;
}

export interface PartnerRegistrationPayload {
  registrationType: "PARTNER";
  organizationName: string;
  countryOfRegistration: string;
  partnerType: string;
  /** Website or domain */
  websiteDomain: string;
  primaryContactName: string;
  title: string;
  mobileNumber: string;
  email: string;
  countriesRegionsOfInterest: string[];
  partnershipInterest: string;
  message: string;
  source: KeyraRegistrationSource;
}
