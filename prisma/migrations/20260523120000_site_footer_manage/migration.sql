-- CreateEnum
CREATE TYPE "SiteFooterLinkSection" AS ENUM ('ON_THIS_SITE', 'KEYRA_APPS');

-- CreateEnum
CREATE TYPE "SiteSocialPlatform" AS ENUM ('LINKEDIN', 'TWITTER', 'INSTAGRAM', 'YOUTUBE', 'GITHUB', 'CUSTOM');

-- CreateTable
CREATE TABLE "SiteFooterSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logoSrc" TEXT,
    "description" TEXT NOT NULL,
    "onThisSiteLabel" TEXT NOT NULL DEFAULT 'On this site',
    "keyraAppsLabel" TEXT NOT NULL DEFAULT 'Keyra apps',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFooterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteFooterLink" (
    "id" TEXT NOT NULL,
    "section" "SiteFooterLinkSection" NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "description" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "internalPath" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteFooterSocialLink" (
    "id" TEXT NOT NULL,
    "platform" "SiteSocialPlatform" NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFooterSocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteFooterLink_section_sortOrder_idx" ON "SiteFooterLink"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "SiteFooterSocialLink_sortOrder_idx" ON "SiteFooterSocialLink"("sortOrder");
