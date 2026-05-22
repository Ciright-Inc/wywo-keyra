import { describe, expect, it } from "vitest";
import {
  validateAdminUserCreate,
  validatePhoneNational,
} from "@/lib/adminUserValidation";

describe("validatePhoneNational", () => {
  it("accepts a valid Irish mobile", () => {
    const result = validatePhoneNational("IE", "871234567");
    expect(result.error).toBeUndefined();
    expect(result.phoneE164).toBe("+353871234567");
  });

  it("rejects an invalid number for the selected country", () => {
    const result = validatePhoneNational("IE", "123");
    expect(result.error).toMatch(/valid mobile number/i);
  });

  it("accepts a valid US mobile", () => {
    const result = validatePhoneNational("US", "2025550123");
    expect(result.error).toBeUndefined();
    expect(result.phoneE164).toBe("+12025550123");
  });
});

describe("validateAdminUserCreate", () => {
  it("returns field errors for missing required values", () => {
    const result = validateAdminUserCreate({
      displayName: "",
      email: "bad",
      phoneCountryCode: "IE",
      phoneNational: "",
      role: "READ_ONLY",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.displayName).toBeTruthy();
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.phone).toBeTruthy();
    }
  });
});
