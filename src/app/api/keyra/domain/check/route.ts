import { honeypotTripped, rateLimitResponse, readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { isValidDomain } from "@/lib/keyraRegistrationValidation";
import { lookupDomainInCore } from "@/services/domainVerificationService";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "domain-check");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ existsInCore: false }, { status: 200 });
  }

  const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";
  if (!domain || !isValidDomain(domain)) {
    return Response.json({ error: "Enter a valid domain." }, { status: 400 });
  }

  const { existsInCore } = await lookupDomainInCore(domain);
  return Response.json({ existsInCore });
}
