-- CreateTable
CREATE TABLE "DeploymentApp" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'Operations',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeploymentApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeploymentApp_section_sortOrder_idx" ON "DeploymentApp"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "DeploymentApp_isActive_idx" ON "DeploymentApp"("isActive");
