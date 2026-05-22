import { describe, expect, it } from "vitest";
import { parsePhoneE164 } from "@/lib/adminUserPhone";

describe("parsePhoneE164", () => {
  it("maps +1 US numbers to US, not Canada", () => {
    const result = parsePhoneE164("+16013899551");
    expect(result.phoneCountryCode).toBe("US");
    expect(result.national).toBe("6013899551");
  });

  it("maps +1 Canadian numbers to CA", () => {
    const result = parsePhoneE164("+14165550123");
    expect(result.phoneCountryCode).toBe("CA");
    expect(result.national).toBe("4165550123");
  });

  it("maps Irish numbers to IE", () => {
    const result = parsePhoneE164("+353871234567");
    expect(result.phoneCountryCode).toBe("IE");
    expect(result.national).toBe("871234567");
  });
});
