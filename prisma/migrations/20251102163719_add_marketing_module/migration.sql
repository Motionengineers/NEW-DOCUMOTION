/*
  Warnings:

  - Added the required column `updatedAt` to the `Agency` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MarketingRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startupId" INTEGER,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "preferredStyle" TEXT,
    "timeline" TEXT,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedAgency" INTEGER,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketingRequest_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgencyProposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "agencyId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "timeline" TEXT NOT NULL,
    "message" TEXT,
    "deliverables" TEXT,
    "workPlan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgencyProposal_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MarketingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgencyProposal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "rating" REAL,
    "description" TEXT,
    "services" TEXT,
    "category" TEXT,
    "portfolioUrls" TEXT,
    "contactEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Agency" ("createdAt", "description", "id", "instagram", "location", "name", "rating", "services", "website") SELECT "createdAt", "description", "id", "instagram", "location", "name", "rating", "services", "website" FROM "Agency";
DROP TABLE "Agency";
ALTER TABLE "new_Agency" RENAME TO "Agency";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MarketingRequest_razorpayOrderId_key" ON "MarketingRequest"("razorpayOrderId");
