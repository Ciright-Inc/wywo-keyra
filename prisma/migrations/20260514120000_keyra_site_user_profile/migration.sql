-- Keyra app session profile persistence (survives logout / new login with same phone).

CREATE TABLE "KeyraSiteUserProfile" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyraSiteUserProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KeyraSiteUserProfile_phoneE164_key" ON "KeyraSiteUserProfile"("phoneE164");
