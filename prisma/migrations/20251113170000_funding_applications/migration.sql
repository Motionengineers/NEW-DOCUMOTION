-- CreateTable
CREATE TABLE "FundingApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "assignedReviewerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "startupName" TEXT,
    "website" TEXT,
    "socialLinks" TEXT,
    "industry" TEXT,
    "stage" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "targetAudience" TEXT,
    "revenue" TEXT,
    "profit" TEXT,
    "customers" TEXT,
    "fundingRaised" TEXT,
    "growthMetrics" TEXT,
    "amountRequested" REAL,
    "equityOffered" REAL,
    "useOfFunds" TEXT,
    "pitchVideoUrl" TEXT,
    "pitchDeckUrl" TEXT,
    "submittedAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundingApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FundingApplication_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FundingApplication_userId_idx" ON "FundingApplication"("userId");
CREATE INDEX "FundingApplication_assignedReviewerId_idx" ON "FundingApplication"("assignedReviewerId");
CREATE INDEX "FundingApplication_status_idx" ON "FundingApplication"("status");
CREATE INDEX "FundingApplication_industry_idx" ON "FundingApplication"("industry");
CREATE INDEX "FundingApplication_stage_idx" ON "FundingApplication"("stage");

-- CreateTable
CREATE TABLE "FundingApplicationDraft" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundingApplicationDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "FundingApplicationDraft_userId_key" ON "FundingApplicationDraft"("userId");

-- CreateTable
CREATE TABLE "FundingApplicationActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" INTEGER NOT NULL,
    "actorUserId" INTEGER,
    "activityType" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundingApplicationActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "FundingApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FundingApplicationActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FundingApplicationActivity_applicationId_idx" ON "FundingApplicationActivity"("applicationId");
CREATE INDEX "FundingApplicationActivity_actorUserId_idx" ON "FundingApplicationActivity"("actorUserId");
CREATE INDEX "FundingApplicationActivity_activityType_idx" ON "FundingApplicationActivity"("activityType");
