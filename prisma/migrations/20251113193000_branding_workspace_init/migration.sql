-- CreateTable
CREATE TABLE "BrandingWorkspace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "agencyId" INTEGER,
    "title" TEXT DEFAULT 'Untitled Brand Workspace',
    "sections" TEXT NOT NULL,
    "suggestions" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BrandingUpload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workspaceId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "parsed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandingUpload_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BrandingWorkspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandingWorkspaceTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workspaceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "category" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandingWorkspaceTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BrandingWorkspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BrandingWorkspace_userId_idx" ON "BrandingWorkspace"("userId");

-- CreateIndex
CREATE INDEX "BrandingWorkspace_agencyId_idx" ON "BrandingWorkspace"("agencyId");

-- CreateIndex
CREATE INDEX "BrandingWorkspace_status_idx" ON "BrandingWorkspace"("status");

-- CreateIndex
CREATE INDEX "BrandingUpload_workspaceId_idx" ON "BrandingUpload"("workspaceId");

-- CreateIndex
CREATE INDEX "BrandingWorkspaceTask_workspaceId_idx" ON "BrandingWorkspaceTask"("workspaceId");

-- CreateIndex
CREATE INDEX "BrandingWorkspaceTask_status_idx" ON "BrandingWorkspaceTask"("status");

