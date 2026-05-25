-- CreateEnum
CREATE TYPE "MaterialMediaKind" AS ENUM ('IMAGE', 'VIDEO', 'GIF', 'OTHER');

-- CreateTable
CREATE TABLE "AdminMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "mediaKind" "MaterialMediaKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminMaterial_isActive_sortOrder_idx" ON "AdminMaterial"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AdminMaterial_mediaKind_idx" ON "AdminMaterial"("mediaKind");
