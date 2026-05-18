/** 100-point Keyra priority model (weights from product brief). */
export function computeKeyraPriorityScore(input: {
  identityRelevance: number;
  telecomRelevance: number;
  bankingRelevance: number;
  governmentRelevance: number;
  appSecurityRelevance: number;
  estimatedAttendees: number | null | undefined;
  yearsRunning: number | null | undefined;
}): number {
  const c = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const id = c(input.identityRelevance) / 100;
  const tel = c(input.telecomRelevance) / 100;
  const bank = c(input.bankingRelevance) / 100;
  const gov = c(input.governmentRelevance) / 100;
  const app = c(input.appSecurityRelevance) / 100;

  const att = input.estimatedAttendees ?? 0;
  let attendeePts = 0;
  if (att >= 100_000) attendeePts = 10;
  else if (att >= 50_000) attendeePts = 8;
  else if (att >= 20_000) attendeePts = 6;
  else if (att >= 5_000) attendeePts = 4;
  else if (att >= 1_000) attendeePts = 2;

  const years = input.yearsRunning ?? 0;
  const yearsPts = Math.min(5, Math.round((years / 15) * 5));

  const raw = id * 25 + tel * 20 + bank * 15 + gov * 15 + app * 10 + attendeePts + yearsPts;
  return Math.round(Math.min(100, raw));
}
