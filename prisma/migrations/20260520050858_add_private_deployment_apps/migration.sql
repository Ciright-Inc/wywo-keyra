-- AlterTable
ALTER TABLE "DeploymentApp" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "DeploymentApp_isPrivate_idx" ON "DeploymentApp"("isPrivate");
