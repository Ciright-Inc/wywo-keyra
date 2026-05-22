import { DeploymentAdminRole } from "@prisma/client";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { PHONE_COUNTRY_OPTIONS } from "@/lib/phoneCountryOptions";

export type AdminUserFieldKey =
  | "displayName"
  | "email"
  | "phoneCountryCode"
  | "phoneNational"
  | "phone"
  | "role";

export type AdminUserFieldErrors = Partial<Record<AdminUserFieldKey, string>>;

const DISPLAY_NAME_MIN = 2;
const DISPLAY_NAME_MAX = 120;
const EMAIL_MAX = 254;

const VALID_COUNTRY_CODES = new Set(PHONE_COUNTRY_OPTIONS.map((c) => c.code));
const ROLE_VALUES = new Set<string>(Object.values(DeploymentAdminRole));

function countryName(code: string): string {
  return PHONE_COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? code;
}

export function validateDisplayName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Name is required.";
  if (v.length < DISPLAY_NAME_MIN) {
    return `Name must be at least ${DISPLAY_NAME_MIN} characters.`;
  }
  if (v.length > DISPLAY_NAME_MAX) {
    return `Name must be at most ${DISPLAY_NAME_MAX} characters.`;
  }
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return "Email is required.";
  if (v.length > EMAIL_MAX) return `Email must be at most ${EMAIL_MAX} characters.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return undefined;
}

export function validatePhoneCountryCode(value: string): string | undefined {
  const v = value.trim().toUpperCase();
  if (!v) return "Country is required.";
  if (!VALID_COUNTRY_CODES.has(v)) return "Select a valid country.";
  return undefined;
}

export function validatePhoneNational(
  phoneCountryCode: string,
  phoneNational: string,
): { error?: string; phoneE164?: string } {
  const countryErr = validatePhoneCountryCode(phoneCountryCode);
  if (countryErr) return { error: countryErr };

  const trimmed = phoneNational.trim();
  if (!trimmed) return { error: "Mobile number is required." };

  const country = phoneCountryCode.trim().toUpperCase() as CountryCode;
  const parsed =
    parsePhoneNumberFromString(trimmed, country) ??
    parsePhoneNumberFromString(trimmed.replace(/\D/g, ""), country);

  if (!parsed || !parsed.isValid()) {
    return { error: `Enter a valid mobile number for ${countryName(country)}.` };
  }

  const type = parsed.getType();
  if (type && type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
    return { error: `Enter a valid mobile number for ${countryName(country)}.` };
  }

  return { phoneE164: parsed.format("E.164") };
}

export function validateRole(value: string): string | undefined {
  if (!ROLE_VALUES.has(value)) return "Select a valid role.";
  return undefined;
}

export type AdminUserCreateInput = {
  displayName: string;
  email: string;
  phoneCountryCode: string;
  phoneNational: string;
  role: string;
  isActive?: boolean;
};

export type AdminUserUpdateInput = {
  displayName?: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNational?: string;
  role?: string;
  isActive?: boolean;
};

export type ValidatedAdminUserCreate = {
  displayName: string;
  email: string;
  phoneE164: string;
  role: DeploymentAdminRole;
  isActive: boolean;
};

export type ValidatedAdminUserUpdate = {
  displayName?: string;
  email?: string;
  phoneE164?: string;
  role?: DeploymentAdminRole;
  isActive?: boolean;
};

function firstErrorMessage(errors: AdminUserFieldErrors): string {
  return (
    errors.displayName ??
    errors.phone ??
    errors.phoneNational ??
    errors.phoneCountryCode ??
    errors.email ??
    errors.role ??
    "Validation failed."
  );
}

export function validateAdminUserCreate(input: AdminUserCreateInput):
  | { ok: true; data: ValidatedAdminUserCreate }
  | { ok: false; errors: AdminUserFieldErrors; message: string } {
  const errors: AdminUserFieldErrors = {};

  const displayNameErr = validateDisplayName(input.displayName);
  if (displayNameErr) errors.displayName = displayNameErr;

  const emailErr = validateEmail(input.email);
  if (emailErr) errors.email = emailErr;

  const roleErr = validateRole(input.role);
  if (roleErr) errors.role = roleErr;

  const phoneResult = validatePhoneNational(input.phoneCountryCode, input.phoneNational);
  if (phoneResult.error) errors.phone = phoneResult.error;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: firstErrorMessage(errors) };
  }

  return {
    ok: true,
    data: {
      displayName: input.displayName.trim(),
      email: input.email.trim().toLowerCase(),
      phoneE164: phoneResult.phoneE164!,
      role: input.role as DeploymentAdminRole,
      isActive: input.isActive !== false,
    },
  };
}

export function validateAdminUserUpdate(input: AdminUserUpdateInput):
  | { ok: true; data: ValidatedAdminUserUpdate }
  | { ok: false; errors: AdminUserFieldErrors; message: string } {
  const errors: AdminUserFieldErrors = {};
  const data: ValidatedAdminUserUpdate = {};

  if (input.displayName !== undefined) {
    const err = validateDisplayName(input.displayName);
    if (err) errors.displayName = err;
    else data.displayName = input.displayName.trim();
  }

  if (input.email !== undefined) {
    const err = validateEmail(input.email);
    if (err) errors.email = err;
    else data.email = input.email.trim().toLowerCase();
  }

  if (input.role !== undefined) {
    const err = validateRole(input.role);
    if (err) errors.role = err;
    else data.role = input.role as DeploymentAdminRole;
  }

  if (input.phoneCountryCode !== undefined || input.phoneNational !== undefined) {
    const phoneResult = validatePhoneNational(
      input.phoneCountryCode ?? "",
      input.phoneNational ?? "",
    );
    if (phoneResult.error) errors.phone = phoneResult.error;
    else data.phoneE164 = phoneResult.phoneE164;
  }

  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: firstErrorMessage(errors) };
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, errors: {}, message: "No changes to save." };
  }

  return { ok: true, data };
}

export function validationErrorResponse(errors: AdminUserFieldErrors, message: string) {
  return { error: message, fieldErrors: errors };
}
