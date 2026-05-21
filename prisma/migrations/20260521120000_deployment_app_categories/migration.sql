-- CreateTable
CREATE TABLE "DeploymentAppCategory" (
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeploymentAppCategory_pkey" PRIMARY KEY ("name")
);

-- Seed default categories
INSERT INTO "DeploymentAppCategory" ("name", "sortOrder") VALUES
  ('Core apps', 0),
  ('Media & engagement', 1),
  ('Operations', 2)
ON CONFLICT ("name") DO NOTHING;

-- Sync any custom categories already used on apps
INSERT INTO "DeploymentAppCategory" ("name", "sortOrder")
SELECT DISTINCT "section", 100
FROM "DeploymentApp"
WHERE "isActive" = true
  AND "section" NOT IN ('Core apps', 'Media & engagement', 'Operations')
ON CONFLICT ("name") DO NOTHING;
