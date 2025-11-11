/*
  Warnings:

  - You are about to drop the column `link` on the `BankScheme` table. All the data in the column will be lost.
  - You are about to drop the column `maxLoanAmt` on the `BankScheme` table. All the data in the column will be lost.
  - You are about to drop the column `minLoanAmt` on the `BankScheme` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BankScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bankName" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'private',
    "description" TEXT,
    "interestRate" TEXT,
    "minLoanAmount" REAL,
    "maxLoanAmount" REAL,
    "officialLink" TEXT,
    "eligibility" TEXT,
    "documentsRequired" TEXT,
    "benefits" TEXT,
    "officialSource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "industry" TEXT,
    "state" TEXT,
    "region" TEXT,
    "tenure" TEXT,
    "collateral" TEXT,
    "source" TEXT,
    "lastUpdatedBy" TEXT,
    "updateNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BankScheme" ("bankName", "collateral", "createdAt", "description", "eligibility", "id", "interestRate", "schemeName", "source", "state", "status", "tenure", "updatedAt") SELECT "bankName", "collateral", "createdAt", "description", "eligibility", "id", "interestRate", "schemeName", "source", "state", coalesce("status", 'active') AS "status", "tenure", "updatedAt" FROM "BankScheme";
DROP TABLE "BankScheme";
ALTER TABLE "new_BankScheme" RENAME TO "BankScheme";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
