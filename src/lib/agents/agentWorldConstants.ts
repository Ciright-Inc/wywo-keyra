import type {
  AgentDomainLayer,
  AgentIndustryVertical,
  AgentOperationalStatus,
  AgentWorldType,
  IntrinsicIndexEntityKind,
  OperationalGraphRelation,
} from "@prisma/client";

export const AGENT_DOMAIN_LAYERS: { value: AgentDomainLayer; label: string; host: string }[] = [
  { value: "CIRIGHT_PARENT", label: "Ciright Parent", host: "agents.ciright.com" },
  { value: "KEYRA_BRIDGE", label: "Keyra Bridge", host: "ciright.agents.keyra.ie" },
  { value: "MARKETPLACE", label: "Marketplace", host: "agents.keyra.ie" },
];

export const AGENT_WORLD_TYPES: { value: AgentWorldType; label: string; description: string }[] = [
  { value: "TELCO", label: "Telco World", description: "SIM, subscriber, roaming, and network agents" },
  { value: "GOVERNMENT", label: "Government World", description: "Population, census, identity, and public service agents" },
  { value: "UNIVERSITY", label: "University World", description: "Admissions, enrollment, and academic integrity agents" },
  { value: "BANKING", label: "Banking World", description: "AML, KYC, fraud, and regulatory reporting agents" },
  { value: "ENTERPRISE", label: "Enterprise World", description: "CRM, sales intelligence, and operational monitoring agents" },
  { value: "HEALTHCARE", label: "Healthcare World", description: "Clinical reporting, identity, and compliance agents" },
];

export const AGENT_INDUSTRY_VERTICALS: { value: AgentIndustryVertical; label: string }[] = [
  { value: "TELECOM", label: "Telecom" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "BANKING", label: "Banking" },
  { value: "UNIVERSITY", label: "University" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "REGULATORY", label: "Regulatory" },
];

export const AGENT_OPERATIONAL_STATUSES: { value: AgentOperationalStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Pending approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "MARKETPLACE_READY", label: "Marketplace ready" },
  { value: "SUBSCRIBED", label: "Subscribed" },
  { value: "DEPLOYING", label: "Deploying" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REVOKED", label: "Revoked" },
];

export const INTRINSIC_INDEX_ENTITY_KINDS: { value: IntrinsicIndexEntityKind; label: string }[] = [
  { value: "PERSON", label: "Person" },
  { value: "IDENTITY", label: "Identity" },
  { value: "DEVICE", label: "Device" },
  { value: "SIM", label: "SIM" },
  { value: "SUBSCRIBER", label: "Subscriber" },
  { value: "AGENT", label: "Agent" },
  { value: "TASK", label: "Task" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "TENANT_WORLD", label: "Tenant World" },
  { value: "COUNTRY", label: "Country" },
  { value: "REGULATORY_BOUNDARY", label: "Regulatory Boundary" },
  { value: "KNOWLEDGE_PACK", label: "Knowledge Pack" },
  { value: "INTEGRATION", label: "Integration" },
  { value: "PARENT_AGENT", label: "Parent Agent" },
  { value: "KEYRA_AGENT", label: "Keyra Agent" },
  { value: "TENANT_AGENT", label: "Tenant Agent" },
];

export const OPERATIONAL_GRAPH_RELATIONS: { value: OperationalGraphRelation; label: string }[] = [
  { value: "INHERITS_FROM", label: "Inherits from" },
  { value: "DEPLOYED_TO", label: "Deployed to" },
  { value: "ATTACHED_TO", label: "Attached to" },
  { value: "CONNECTED_TO", label: "Connected to" },
  { value: "GOVERNS", label: "Governs" },
  { value: "EXECUTES", label: "Executes" },
  { value: "AUDITS", label: "Audits" },
  { value: "CONTAINS", label: "Contains" },
  { value: "BELONGS_TO", label: "Belongs to" },
  { value: "REGULATED_BY", label: "Regulated by" },
];

export const KNOWLEDGE_PACK_CATEGORIES = [
  "Telecom Intelligence Pack",
  "Banking Compliance Pack",
  "Population Statistics Pack",
  "University Admissions Pack",
  "Government Reporting Pack",
  "RFP Response Pack",
  "Regulatory Pack",
  "Country Pack",
  "Infrastructure Pack",
] as const;

export function labelForStatus(status: AgentOperationalStatus): string {
  return AGENT_OPERATIONAL_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function labelForWorldType(type: AgentWorldType): string {
  return AGENT_WORLD_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function labelForIndustry(vertical: AgentIndustryVertical): string {
  return AGENT_INDUSTRY_VERTICALS.find((v) => v.value === vertical)?.label ?? vertical;
}

export function labelForDomainLayer(layer: AgentDomainLayer): string {
  return AGENT_DOMAIN_LAYERS.find((l) => l.value === layer)?.label ?? layer;
}

export function labelForEntityKind(kind: IntrinsicIndexEntityKind): string {
  return INTRINSIC_INDEX_ENTITY_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export function labelForGraphRelation(relation: OperationalGraphRelation): string {
  return OPERATIONAL_GRAPH_RELATIONS.find((r) => r.value === relation)?.label ?? relation;
}
