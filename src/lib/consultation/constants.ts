/** Organization types for consultation intake. */
export const CONSULTATION_ORG_TYPES = [
  "Telecommunications Carrier",
  "Bank / Financial Institution",
  "Government",
  "Enterprise",
  "Developer",
  "Investor",
  "Partner",
  "Healthcare",
  "Gaming / Gambling",
  "Automotive",
  "Education",
  "Other",
] as const;

export type ConsultationOrgType = (typeof CONSULTATION_ORG_TYPES)[number];

/** Multi-select consultation topics. */
export const CONSULTATION_TOPICS = [
  "Authentication Strategy",
  "SIM-Bound Identity",
  "eSIM / iSIM / Secure Element",
  "Fraud Prevention",
  "Account Takeover Reduction",
  "AI Agent Identity",
  "Workforce Identity",
  "Developer SDK / API Integration",
  "Carrier Integration",
  "Banking Authentication",
  "Government Identity",
  "Secure Devices",
  "Regulatory / Compliance",
  "Enterprise Deployment",
  "Strategic Partnership",
  "Investment / Capital",
  "Other",
] as const;

export type ConsultationTopic = (typeof CONSULTATION_TOPICS)[number];

/** Video consultation types with duration (minutes). */
export const CONSULTATION_TYPES = [
  {
    id: "executive-strategic",
    title: "Executive Strategic Consultation",
    description:
      "For CEOs, founders, board members, government leaders, carrier executives, banking leaders, and strategic partners.",
    durationMinutes: 60,
    audience: "executive",
  },
  {
    id: "technical-architecture",
    title: "Technical Architecture Review",
    description:
      "For CTOs, CISOs, architects, engineers, developers, and integration teams.",
    durationMinutes: 60,
    audience: "technical",
  },
  {
    id: "deployment-readiness",
    title: "Deployment Readiness Session",
    description:
      "For organizations preparing pilots, enterprise rollouts, national deployments, or carrier integrations.",
    durationMinutes: 90,
    audience: "deployment",
  },
  {
    id: "partner-investor",
    title: "Partner / Investor Discussion",
    description:
      "For strategic partners, capital groups, ecosystem partners, and commercial representatives.",
    durationMinutes: 45,
    audience: "partner",
  },
] as const;

export type ConsultationTypeId = (typeof CONSULTATION_TYPES)[number]["id"];

export const CONSULTATION_SOURCE = "consult.keyra.ie";
export const EMAIL_REQUEST_TYPE = "Email Consultation Request";
export const CALENDAR_REQUEST_TYPE = "Video Consultation";

export function consultationTypeById(id: string) {
  return CONSULTATION_TYPES.find((t) => t.id === id);
}
