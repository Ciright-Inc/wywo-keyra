-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "phoneE164" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_phoneE164_key" ON "AdminUser"("phoneE164");
