-- CreateIndex
CREATE UNIQUE INDEX "FeedInteraction_postId_userId_type_key" ON "FeedInteraction"("postId", "userId", "type");
