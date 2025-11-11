-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GovtScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schemeName" TEXT NOT NULL,
    "ministry" TEXT,
    "department" TEXT,
    "category" TEXT,
    "benefitType" TEXT,
    "benefits" TEXT,
    "maxAssistance" TEXT,
    "amountRange" TEXT,
    "eligibility" TEXT,
    "sectors" TEXT,
    "region" TEXT,
    "applicationProcess" TEXT,
    "officialLink" TEXT,
    "applicationLink" TEXT,
    "status" TEXT DEFAULT 'Active',
    "description" TEXT,
    "criteria" TEXT,
    "deadline" DATETIME,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GovtScheme" ("amountRange", "applicationLink", "benefitType", "createdAt", "criteria", "deadline", "department", "description", "eligibility", "id", "ministry", "region", "schemeName", "sectors", "source", "status", "updatedAt") SELECT "amountRange", "applicationLink", "benefitType", "createdAt", "criteria", "deadline", "department", "description", "eligibility", "id", "ministry", "region", "schemeName", "sectors", "source", "status", "updatedAt" FROM "GovtScheme";
DROP TABLE "GovtScheme";
ALTER TABLE "new_GovtScheme" RENAME TO "GovtScheme";
CREATE UNIQUE INDEX "GovtScheme_schemeName_key" ON "GovtScheme"("schemeName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
