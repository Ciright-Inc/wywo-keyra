-- CreateEnum
CREATE TYPE "DataRoomDocumentKind" AS ENUM ('PDF', 'TEXT', 'WORD', 'SPREADSHEET', 'PRESENTATION', 'OTHER');

-- CreateTable
CREATE TABLE "AdminDataRoom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentKind" "DataRoomDocumentKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminDataRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminDataRoom_isActive_sortOrder_idx" ON "AdminDataRoom"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AdminDataRoom_documentKind_idx" ON "AdminDataRoom"("documentKind");

-- CreateIndex
CREATE UNIQUE INDEX "AdminDataRoom_active_sortOrder_key" ON "AdminDataRoom"("sortOrder") WHERE "isActive" = true;
