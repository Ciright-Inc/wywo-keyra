-- Extend AuthenticationCountry for global sovereign dataset + feed eligibility

ALTER TABLE "AuthenticationCountry" ADD COLUMN "officialName" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "iso3" VARCHAR(3);
ALTER TABLE "AuthenticationCountry" ADD COLUMN "isoNumeric" VARCHAR(3);
ALTER TABLE "AuthenticationCountry" ADD COLUMN "subRegion" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "capitalCity" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "flagEmoji" VARCHAR(8);
ALTER TABLE "AuthenticationCountry" ADD COLUMN "flagAssetPath" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "phoneCountryCode" VARCHAR(32);
ALTER TABLE "AuthenticationCountry" ADD COLUMN "currencyCode" VARCHAR(3);
ALTER TABLE "AuthenticationCountry" ADD COLUMN "currencyName" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "primaryLanguage" TEXT;
ALTER TABLE "AuthenticationCountry" ADD COLUMN "authenticationEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "AuthenticationCountry" ALTER COLUMN "percentageWeight" SET DEFAULT 5;

CREATE UNIQUE INDEX "AuthenticationCountry_iso3_key" ON "AuthenticationCountry"("iso3");
CREATE INDEX "AuthenticationCountry_active_authenticationEnabled_idx" ON "AuthenticationCountry"("active", "authenticationEnabled");
CREATE INDEX "AuthenticationCountry_subRegion_idx" ON "AuthenticationCountry"("subRegion");
