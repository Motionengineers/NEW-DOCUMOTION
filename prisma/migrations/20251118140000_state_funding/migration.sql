-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StateFundingScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fundingAmount" TEXT,
    "interestRate" REAL,
    "sector" TEXT,
    "eligibility" TEXT,
    "applyLink" TEXT,
    "officialLink" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',
    CONSTRAINT "StateFundingScheme_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE INDEX "State_name_idx" ON "State"("name");

-- CreateIndex
CREATE INDEX "StateFundingScheme_stateId_idx" ON "StateFundingScheme"("stateId");

-- CreateIndex
CREATE INDEX "StateFundingScheme_sector_idx" ON "StateFundingScheme"("sector");

-- CreateIndex
CREATE INDEX "StateFundingScheme_status_idx" ON "StateFundingScheme"("status");


