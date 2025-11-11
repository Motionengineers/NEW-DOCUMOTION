-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "documents" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "registrationStatus" TEXT NOT NULL DEFAULT 'initiated',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "amount" REAL,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceRequest_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_razorpayOrderId_key" ON "ServiceRequest"("razorpayOrderId");
