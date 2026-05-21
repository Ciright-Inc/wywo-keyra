import { describe, expect, it } from "vitest";
import { emailDomainFromAddress, matchAccessDomainRule } from "@/lib/deployments/accessRequest";

describe("accessRequest email domain matching", () => {
  it("extracts domain from email", () => {
    expect(emailDomainFromAddress("Jane.Doe@MAIL.uidai.gov.in")).toBe("mail.uidai.gov.in");
  });

  it("matches exact and subdomain suffix rules", () => {
    const rules = [{ allowedEmailDomain: "uidai.gov.in", isActive: true }];
    expect(matchAccessDomainRule("uidai.gov.in", rules).matched).toBe(true);
    expect(matchAccessDomainRule("mail.uidai.gov.in", rules).matched).toBe(true);
    expect(matchAccessDomainRule("notuidai.gov.in", rules).matched).toBe(false);
  });

  it("ignores inactive rules", () => {
    const rules = [{ allowedEmailDomain: "gov.ie", isActive: false }];
    expect(matchAccessDomainRule("user@gov.ie", rules).matched).toBe(false);
  });
});
