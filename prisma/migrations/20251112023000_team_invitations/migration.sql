-- Alter User table to support team roles and agency membership
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT,
  "role" TEXT NOT NULL DEFAULT 'founder',
  "teamRole" TEXT NOT NULL DEFAULT 'VIEWER',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "agencyId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  "emailVerified" DATETIME,
  "image" TEXT,
  CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_User" (
  "id", "email", "name", "passwordHash", "role", "createdAt",
  "updatedAt", "emailVerified", "image"
) SELECT
  "id", "email", "name", "passwordHash", "role", "createdAt",
  "updatedAt", "emailVerified", "image"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;

-- Create TeamInvitation table for managing pending invites
CREATE TABLE "TeamInvitation" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT NOT NULL DEFAULT 'VIEWER',
  "agencyId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "createdById" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" DATETIME NOT NULL,
  "acceptedAt" DATETIME,
  "acceptedById" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "metadata" TEXT,
  CONSTRAINT "TeamInvitation_agencyId_fkey"
    FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamInvitation_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamInvitation_acceptedById_fkey"
    FOREIGN KEY ("acceptedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TeamInvitation_token_key" ON "TeamInvitation"("token");
CREATE UNIQUE INDEX "TeamInvitation_tokenHash_key" ON "TeamInvitation"("tokenHash");
CREATE INDEX "TeamInvitation_email_idx" ON "TeamInvitation"("email");

