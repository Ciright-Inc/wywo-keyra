-- Keyra consumer protection dashboard (devices, locations, identity watch)

CREATE TABLE "KeyraUserProtection" (
    "phoneE164" TEXT NOT NULL,
    "lastScanAt" TIMESTAMP(3),
    "scanStatus" TEXT NOT NULL DEFAULT 'clear',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyraUserProtection_pkey" PRIMARY KEY ("phoneE164")
);

CREATE TABLE "KeyraUserDevice" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deviceKind" TEXT NOT NULL,
    "userAgentHash" TEXT NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KeyraUserDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KeyraUserDevice_phoneE164_userAgentHash_key" ON "KeyraUserDevice"("phoneE164", "userAgentHash");
CREATE INDEX "KeyraUserDevice_phoneE164_idx" ON "KeyraUserDevice"("phoneE164");

CREATE TABLE "KeyraTrustedLocation" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "regionHint" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KeyraTrustedLocation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KeyraTrustedLocation_phoneE164_idx" ON "KeyraTrustedLocation"("phoneE164");
