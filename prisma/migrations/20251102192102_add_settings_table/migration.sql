-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BankScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bankName" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "type" TEXT,
    "minLoanAmount" REAL,
    "maxLoanAmount" REAL,
    "interestRate" TEXT,
    "tenure" TEXT,
    "processingFees" TEXT,
    "eligibility" TEXT,
    "documentsRequired" TEXT,
    "sectors" TEXT,
    "states" TEXT,
    "description" TEXT,
    "officialSource" TEXT,
    "status" TEXT DEFAULT 'Active',
    "sourceFetchedAt" DATETIME,
    "benefits" TEXT,
    "industry" TEXT,
    "state" TEXT,
    "region" TEXT,
    "collateral" TEXT,
    "source" TEXT,
    "lastUpdatedBy" TEXT,
    "updateNotes" TEXT,
    "officialLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BankScheme" ("bankName", "benefits", "collateral", "createdAt", "description", "documentsRequired", "eligibility", "id", "industry", "interestRate", "lastUpdatedBy", "maxLoanAmount", "minLoanAmount", "officialLink", "officialSource", "processingFees", "region", "schemeName", "sectors", "source", "sourceFetchedAt", "state", "states", "status", "tenure", "type", "updateNotes", "updatedAt") SELECT "bankName", "benefits", "collateral", "createdAt", "description", "documentsRequired", "eligibility", "id", "industry", "interestRate", "lastUpdatedBy", "maxLoanAmount", "minLoanAmount", "officialLink", "officialSource", "processingFees", "region", "schemeName", "sectors", "source", "sourceFetchedAt", "state", "states", "status", "tenure", "type", "updateNotes", "updatedAt" FROM "BankScheme";
DROP TABLE "BankScheme";
ALTER TABLE "new_BankScheme" RENAME TO "BankScheme";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
