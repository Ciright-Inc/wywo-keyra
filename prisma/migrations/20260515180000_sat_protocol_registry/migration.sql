-- SAT-Core global protocol registry: extended metadata + trust / sector flags

ALTER TABLE "SatProtocol" ADD COLUMN "protocolSlug" TEXT;
ALTER TABLE "SatProtocol" ADD COLUMN "shortDescription" TEXT;
ALTER TABLE "SatProtocol" ADD COLUMN "longDescription" TEXT;
ALTER TABLE "SatProtocol" ADD COLUMN "securityClassification" VARCHAR(24) NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "SatProtocol" ADD COLUMN "flagEnterprise" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "flagGovernment" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "flagTelco" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "flagConsumer" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "flagAiAgent" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SatProtocol" ADD COLUMN "iconKey" VARCHAR(64);
ALTER TABLE "SatProtocol" ADD COLUMN "colorTheme" VARCHAR(32);
ALTER TABLE "SatProtocol" ADD COLUMN "trustLevel" INTEGER NOT NULL DEFAULT 4;
ALTER TABLE "SatProtocol" ADD COLUMN "riskReductionScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SatProtocol" ADD COLUMN "globalAvailability" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "apiReady" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "auditRequired" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "consentRequired" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SatProtocol" ADD COLUMN "zeroKnowledgeCompatible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SatProtocol" ADD COLUMN "simOrEsimRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SatProtocol" ADD COLUMN "deviceBindingRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SatProtocol" ADD COLUMN "createdBySystem" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "SatProtocol" ALTER COLUMN "percentageWeight" SET DEFAULT 60;
ALTER TABLE "SatProtocol" ALTER COLUMN "homePercentage" SET DEFAULT 40;
ALTER TABLE "SatProtocol" ALTER COLUMN "roamingPercentage" SET DEFAULT 60;

CREATE UNIQUE INDEX "SatProtocol_protocolSlug_key" ON "SatProtocol"("protocolSlug");
CREATE INDEX "SatProtocol_protocolCategory_idx" ON "SatProtocol"("protocolCategory");
CREATE INDEX "SatProtocol_displayOrder_idx" ON "SatProtocol"("displayOrder");
