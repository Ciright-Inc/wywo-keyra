import type { ConsultationOrgType, ConsultationTopic } from "@/lib/consultation/constants";

const ORG_WEIGHT: Partial<Record<ConsultationOrgType, number>> = {
  "Telecommunications Carrier": 30,
  Government: 28,
  "Bank / Financial Institution": 26,
  Enterprise: 18,
  Partner: 16,
  Investor: 14,
  Developer: 10,
};

const TOPIC_WEIGHT: Partial<Record<ConsultationTopic, number>> = {
  "Enterprise Deployment": 12,
  "Carrier Integration": 12,
  "Government Identity": 11,
  "Banking Authentication": 11,
  "Strategic Partnership": 10,
  "Investment / Capital": 10,
  "SIM-Bound Identity": 8,
  "Fraud Prevention": 8,
  "AI Agent Identity": 8,
};

/** Higher score = higher advisory priority. */
export function computeConsultationPriorityScore(input: {
  organizationType: string;
  topics: string[];
  requestMethod: "email" | "calendar";
  consultationTypeId?: string;
}): number {
  let score = 40;
  const orgW = ORG_WEIGHT[input.organizationType as ConsultationOrgType];
  if (orgW) score += orgW;

  for (const t of input.topics) {
    const tw = TOPIC_WEIGHT[t as ConsultationTopic];
    if (tw) score += tw;
  }

  if (input.requestMethod === "calendar") score += 15;
  if (input.consultationTypeId === "executive-strategic") score += 20;
  if (input.consultationTypeId === "deployment-readiness") score += 12;

  return Math.min(score, 100);
}
