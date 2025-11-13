-- CreateTable
CREATE TABLE "FeedPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "authorUserId" INTEGER NOT NULL,
    "startupId" INTEGER,
    "body" TEXT,
    "embedUrl" TEXT,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "linkUrl" TEXT,
    "linkTitle" TEXT,
    "linkDescription" TEXT,
    "professional" INTEGER NOT NULL DEFAULT 0,
    "tagList" TEXT,
    "stage" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedPost_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedPost_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FeedPost_authorUserId_idx" ON "FeedPost"("authorUserId");
CREATE INDEX "FeedPost_createdAt_idx" ON "FeedPost"("createdAt");
CREATE INDEX "FeedPost_tagList_idx" ON "FeedPost"("tagList");

-- CreateTable
CREATE TABLE "FeedPostMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    CONSTRAINT "FeedPostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FeedPostMedia_postId_idx" ON "FeedPostMedia"("postId");

-- CreateTable
CREATE TABLE "FeedPostTag" (
    "postId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "FeedPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("postId", "tag")
);

-- CreateTable
CREATE TABLE "FeedInteraction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FeedInteraction_postId_idx" ON "FeedInteraction"("postId");
CREATE INDEX "FeedInteraction_userId_idx" ON "FeedInteraction"("userId");

-- CreateTable
CREATE TABLE "FeedComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "parentCommentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "FeedComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FeedComment_postId_idx" ON "FeedComment"("postId");
CREATE INDEX "FeedComment_parentCommentId_idx" ON "FeedComment"("parentCommentId");

-- CreateTable
CREATE TABLE "FeedFollow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "followerUserId" INTEGER NOT NULL,
    "targetUserId" INTEGER,
    "targetStartupId" INTEGER,
    "tag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedFollow_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedFollow_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedFollow_targetStartupId_fkey" FOREIGN KEY ("targetStartupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FeedFollow_targetUserId_idx" ON "FeedFollow"("targetUserId");
CREATE INDEX "FeedFollow_targetStartupId_idx" ON "FeedFollow"("targetStartupId");
CREATE INDEX "FeedFollow_tag_idx" ON "FeedFollow"("tag");

-- CreateTable
CREATE TABLE "FeedBookmark" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedBookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("userId", "postId")
);

-- CreateTable
CREATE TABLE "FeedNotification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER,
    "type" TEXT NOT NULL,
    "payload" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "FeedPost" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FeedNotification_userId_idx" ON "FeedNotification"("userId");
CREATE INDEX "FeedNotification_postId_idx" ON "FeedNotification"("postId");

-- CreateTable
CREATE TABLE "FeedTopicPreference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tags" TEXT,
    "stages" TEXT,
    "industries" TEXT,
    "locations" TEXT,
    CONSTRAINT "FeedTopicPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "FeedTopicPreference_userId_idx" ON "FeedTopicPreference"("userId");

