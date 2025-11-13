-- AlterTable
ALTER TABLE "Agency" ADD COLUMN "country" TEXT DEFAULT 'India';
ALTER TABLE "Agency" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Agency" ADD COLUMN "bannerUrl" TEXT;
ALTER TABLE "Agency" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "Agency" ADD COLUMN "youtube" TEXT;
ALTER TABLE "Agency" ADD COLUMN "twitter" TEXT;
ALTER TABLE "Agency" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Agency" ADD COLUMN "currency" TEXT DEFAULT 'INR';
ALTER TABLE "Agency" ADD COLUMN "verifiedAt" DATETIME;
ALTER TABLE "Agency" ADD COLUMN "verifiedBy" TEXT;
ALTER TABLE "Agency" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Agency" ADD COLUMN "foundedYear" INTEGER;
ALTER TABLE "Agency" ADD COLUMN "employees" INTEGER;

-- CreateTable
CREATE TABLE "AgencyService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agencyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "deliveryType" TEXT,
    "minTimeline" TEXT,
    "maxTimeline" TEXT,
    "startingPrice" INTEGER,
    "currency" TEXT DEFAULT 'INR',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgencyService_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgencyPortfolio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agencyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "mediaType" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "caseStudyUrl" TEXT,
    "clientName" TEXT,
    "industry" TEXT,
    "year" INTEGER,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgencyPortfolio_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgencyReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agencyId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "company" TEXT,
    "projectType" TEXT,
    "rating" INTEGER NOT NULL,
    "headline" TEXT,
    "comment" TEXT,
    "response" TEXT,
    "respondedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgencyReview_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgencyLead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agencyId" INTEGER NOT NULL,
    "projectType" TEXT NOT NULL,
    "projectScope" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "currency" TEXT DEFAULT 'INR',
    "timeline" TEXT,
    "startDate" DATETIME,
    "description" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "companyName" TEXT,
    "designation" TEXT,
    "source" TEXT DEFAULT 'portal',
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgencyLead_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AgencyService_agencyId_idx" ON "AgencyService"("agencyId");
CREATE UNIQUE INDEX "AgencyService_agencyId_name_key" ON "AgencyService"("agencyId", "name");
CREATE UNIQUE INDEX "AgencyPortfolio_slug_key" ON "AgencyPortfolio"("slug");
CREATE INDEX "AgencyPortfolio_agencyId_idx" ON "AgencyPortfolio"("agencyId");
CREATE INDEX "AgencyReview_agencyId_idx" ON "AgencyReview"("agencyId");
CREATE INDEX "AgencyReview_rating_idx" ON "AgencyReview"("rating");
CREATE INDEX "AgencyLead_agencyId_idx" ON "AgencyLead"("agencyId");
CREATE INDEX "AgencyLead_status_idx" ON "AgencyLead"("status");
