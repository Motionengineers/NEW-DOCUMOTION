-- CreateTable
CREATE TABLE "BrandingPartner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "portfolioUrl" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "rating" REAL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BrandingPartnerBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partnerId" INTEGER NOT NULL,
    "requesterId" INTEGER,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requestNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandingPartnerBooking_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "BrandingPartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BrandingPartner_type_idx" ON "BrandingPartner"("type");

-- CreateIndex
CREATE INDEX "BrandingPartner_verified_idx" ON "BrandingPartner"("verified");

-- CreateIndex
CREATE INDEX "BrandingPartner_city_idx" ON "BrandingPartner"("city");

-- CreateIndex
CREATE INDEX "BrandingPartnerBooking_partnerId_idx" ON "BrandingPartnerBooking"("partnerId");

-- CreateIndex
CREATE INDEX "BrandingPartnerBooking_requesterEmail_idx" ON "BrandingPartnerBooking"("requesterEmail");

-- CreateIndex
CREATE INDEX "BrandingPartnerBooking_status_idx" ON "BrandingPartnerBooking"("status");


