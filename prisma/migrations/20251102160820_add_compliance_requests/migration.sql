-- CreateTable
CREATE TABLE "ComplianceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "complianceType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "documents" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "progressStatus" TEXT NOT NULL DEFAULT 'initiated',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "amount" REAL,
    "deadline" DATETIME,
    "notes" TEXT,
    "certificateUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceRequest_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRequest_razorpayOrderId_key" ON "ComplianceRequest"("razorpayOrderId");
