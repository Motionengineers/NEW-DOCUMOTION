-- CreateTable
CREATE TABLE "MAListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "startupId" INTEGER,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "stage" TEXT,
    "revenue" INTEGER,
    "profit" INTEGER,
    "users" INTEGER,
    "askingPrice" INTEGER,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "teamSize" INTEGER,
    "assets" TEXT,
    "pitchDeckUrl" TEXT,
    "documents" TEXT,
    "whySelling" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "interestedUsers" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MAListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MAListing_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MADealRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "user1" INTEGER NOT NULL,
    "user2" INTEGER NOT NULL,
    "messages" TEXT,
    "dealStatus" TEXT NOT NULL DEFAULT 'negotiating',
    "documents" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MADealRoom_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MAListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
