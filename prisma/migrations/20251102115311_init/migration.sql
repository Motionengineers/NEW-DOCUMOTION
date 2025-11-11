-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'founder',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Startup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT,
    "sector" TEXT,
    "location" TEXT,
    "dpiitNumber" TEXT,
    "foundingYear" INTEGER,
    "teamSize" INTEGER,
    "revenue" REAL,
    "registeredAs" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Startup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" DATETIME,
    CONSTRAINT "Document_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GovtScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schemeName" TEXT NOT NULL,
    "ministry" TEXT,
    "department" TEXT,
    "benefitType" TEXT,
    "amountRange" TEXT,
    "eligibility" TEXT,
    "sectors" TEXT,
    "region" TEXT,
    "applicationLink" TEXT,
    "status" TEXT,
    "description" TEXT,
    "criteria" TEXT,
    "deadline" DATETIME,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankScheme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bankName" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "description" TEXT,
    "interestRate" REAL,
    "maxLoanAmt" REAL,
    "minLoanAmt" REAL,
    "eligibility" TEXT,
    "link" TEXT,
    "state" TEXT,
    "tenure" TEXT,
    "collateral" TEXT,
    "status" TEXT DEFAULT 'active',
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "skills" TEXT,
    "experience" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "portfolio" TEXT,
    "availability" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "education" TEXT,
    "specializations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PitchDeck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "stage" TEXT,
    "category" TEXT,
    "industry" TEXT,
    "source" TEXT,
    "fileUrl" TEXT NOT NULL,
    "thumbnail" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutoApplyLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "schemeId" INTEGER NOT NULL,
    "schemeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AutoApplyLog_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DashboardStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "razorpayId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_slug_key" ON "Startup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Startup_dpiitNumber_key" ON "Startup"("dpiitNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FounderProfile_email_key" ON "FounderProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardStat_metric_key" ON "DashboardStat"("metric");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpayId_key" ON "Subscription"("razorpayId");
