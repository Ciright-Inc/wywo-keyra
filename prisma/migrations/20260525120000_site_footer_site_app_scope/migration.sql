-- Per-app scope for "On this site" footer links
ALTER TABLE "SiteFooterLink" ADD COLUMN "siteAppId" TEXT;

-- Existing marketing-site links belong to keyra.ie
UPDATE "SiteFooterLink"
SET "siteAppId" = 'keyra-ie'
WHERE "section" = 'ON_THIS_SITE' AND "siteAppId" IS NULL;

DROP INDEX IF EXISTS "SiteFooterLink_section_sortOrder_idx";
CREATE INDEX "SiteFooterLink_section_siteAppId_sortOrder_idx" ON "SiteFooterLink"("section", "siteAppId", "sortOrder");
