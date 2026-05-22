import { validateHomeRoaming } from "@/lib/satProtocol/validateHomeRoaming";
import {
  SAT_PROTOCOL_DEFAULT_HOME,
  SAT_PROTOCOL_DEFAULT_ROAMING,
  SAT_PROTOCOL_DEFAULT_WEIGHT,
} from "@/lib/satProtocol/registry";

export type ProtocolFormValues = {
  protocolName: string;
  protocolCode: string;
  protocolCategory: string;
  percentageWeight: number;
  homePercentage: number;
  roamingPercentage: number;
  trustLevel: number;
  securityClassification: string;
  colorTheme: string;
  iconKey: string;
  flagEnterprise: boolean;
  flagGovernment: boolean;
  flagTelco: boolean;
  flagConsumer: boolean;
  flagAiAgent: boolean;
  zeroKnowledgeCompatible: boolean;
  simOrEsimRequired: boolean;
  globalAvailability: boolean;
  apiReady: boolean;
  active: boolean;
};

export type ProtocolFormRow = {
  id: string;
  protocolName: string;
  protocolCode: string;
  protocolCategory: string;
  percentageWeight: number;
  homePercentage: number;
  roamingPercentage: number;
  active: boolean;
  trustLevel?: number | null;
  securityClassification?: string | null;
  colorTheme?: string | null;
  iconKey?: string | null;
  flagEnterprise?: boolean | null;
  flagGovernment?: boolean | null;
  flagTelco?: boolean | null;
  flagConsumer?: boolean | null;
  flagAiAgent?: boolean | null;
  zeroKnowledgeCompatible?: boolean | null;
  simOrEsimRequired?: boolean | null;
  globalAvailability?: boolean | null;
  apiReady?: boolean | null;
  protocolSlug?: string | null;
  protocolMemo?: string;
};

export function emptyProtocolFormValues(): ProtocolFormValues {
  return {
    protocolName: "",
    protocolCode: "",
    protocolCategory: "Identity",
    percentageWeight: SAT_PROTOCOL_DEFAULT_WEIGHT,
    homePercentage: SAT_PROTOCOL_DEFAULT_HOME,
    roamingPercentage: SAT_PROTOCOL_DEFAULT_ROAMING,
    trustLevel: 4,
    securityClassification: "STANDARD",
    colorTheme: "sky",
    iconKey: "",
    flagEnterprise: true,
    flagGovernment: true,
    flagTelco: true,
    flagConsumer: true,
    flagAiAgent: true,
    zeroKnowledgeCompatible: false,
    simOrEsimRequired: false,
    globalAvailability: true,
    apiReady: true,
    active: true,
  };
}

export function protocolFormValuesFromRow(row: ProtocolFormRow): ProtocolFormValues {
  return {
    protocolName: row.protocolName,
    protocolCode: row.protocolCode,
    protocolCategory: row.protocolCategory,
    percentageWeight: row.percentageWeight,
    homePercentage: row.homePercentage,
    roamingPercentage: row.roamingPercentage,
    trustLevel: row.trustLevel ?? 4,
    securityClassification: row.securityClassification ?? "STANDARD",
    colorTheme: row.colorTheme ?? "sky",
    iconKey: row.iconKey ?? "",
    flagEnterprise: row.flagEnterprise ?? true,
    flagGovernment: row.flagGovernment ?? true,
    flagTelco: row.flagTelco ?? true,
    flagConsumer: row.flagConsumer ?? true,
    flagAiAgent: row.flagAiAgent ?? true,
    zeroKnowledgeCompatible: row.zeroKnowledgeCompatible ?? false,
    simOrEsimRequired: row.simOrEsimRequired ?? false,
    globalAvailability: row.globalAvailability !== false,
    apiReady: row.apiReady !== false,
    active: row.active,
  };
}

export function protocolFormValuesToPayload(values: ProtocolFormValues) {
  return {
    protocolName: values.protocolName.trim(),
    protocolCode: values.protocolCode.trim().toUpperCase(),
    protocolCategory: values.protocolCategory.trim(),
    percentageWeight: values.percentageWeight,
    homePercentage: values.homePercentage,
    roamingPercentage: values.roamingPercentage,
    trustLevel: Math.trunc(values.trustLevel),
    securityClassification: values.securityClassification.trim() || "STANDARD",
    colorTheme: values.colorTheme.trim() || null,
    iconKey: values.iconKey.trim() || null,
    flagEnterprise: values.flagEnterprise,
    flagGovernment: values.flagGovernment,
    flagTelco: values.flagTelco,
    flagConsumer: values.flagConsumer,
    flagAiAgent: values.flagAiAgent,
    zeroKnowledgeCompatible: values.zeroKnowledgeCompatible,
    simOrEsimRequired: values.simOrEsimRequired,
    globalAvailability: values.globalAvailability,
    apiReady: values.apiReady,
    active: values.active,
  };
}

export function validateProtocolForm(values: ProtocolFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.protocolName.trim()) errors.protocolName = "Name is required.";
  if (!values.protocolCode.trim()) errors.protocolCode = "Code is required.";
  if (!values.protocolCategory.trim()) errors.protocolCategory = "Category is required.";

  if (!Number.isFinite(values.percentageWeight) || values.percentageWeight <= 0) {
    errors.percentageWeight = "Weight must be greater than zero.";
  }

  const homeRoamError = validateHomeRoaming(values.homePercentage, values.roamingPercentage);
  if (homeRoamError) {
    errors.homePercentage = homeRoamError;
    errors.roamingPercentage = homeRoamError;
  }

  if (!Number.isFinite(values.trustLevel) || values.trustLevel < 1 || values.trustLevel > 5) {
    errors.trustLevel = "Trust level must be between 1 and 5.";
  }

  return errors;
}
