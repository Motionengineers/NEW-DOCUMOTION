-- RedefineTable: State
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_State" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "region" TEXT,
    "population" INTEGER,
    "gdp" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_State" ("id", "name", "abbreviation", "description", "createdAt", "updatedAt")
SELECT "id", "name", "abbreviation", "description", "createdAt", "updatedAt"
FROM "State";

DROP TABLE "State";
ALTER TABLE "new_State" RENAME TO "State";

CREATE UNIQUE INDEX "State_name_key" ON "State"("name");
CREATE INDEX "State_name_idx" ON "State"("name");

-- RedefineTable: StateFundingScheme
CREATE TABLE "new_StateFundingScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fundingAmount" TEXT,
    "interestRate" REAL,
    "sector" TEXT,
    "subSector" TEXT,
    "eligibility" TEXT,
    "eligibilityJson" TEXT,
    "applyLink" TEXT,
    "officialLink" TEXT,
    "centralOrState" TEXT NOT NULL DEFAULT 'State',
    "fundingType" TEXT,
    "fundingMin" INTEGER,
    "fundingMax" INTEGER,
    "subsidyPercent" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "popularityScore" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    CONSTRAINT "StateFundingScheme_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_StateFundingScheme" (
    "id",
    "stateId",
    "title",
    "description",
    "fundingAmount",
    "interestRate",
    "sector",
    "eligibility",
    "applyLink",
    "officialLink",
    "lastUpdated",
    "status"
)
SELECT
    "id",
    "stateId",
    "title",
    "description",
    "fundingAmount",
    "interestRate",
    "sector",
    "eligibility",
    "applyLink",
    "officialLink",
    "lastUpdated",
    "status"
FROM "StateFundingScheme";

DROP TABLE "StateFundingScheme";
ALTER TABLE "new_StateFundingScheme" RENAME TO "StateFundingScheme";

CREATE INDEX "StateFundingScheme_stateId_idx" ON "StateFundingScheme"("stateId");
CREATE INDEX "StateFundingScheme_sector_idx" ON "StateFundingScheme"("sector");
CREATE INDEX "StateFundingScheme_fundingType_idx" ON "StateFundingScheme"("fundingType");
CREATE INDEX "StateFundingScheme_status_idx" ON "StateFundingScheme"("status");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

