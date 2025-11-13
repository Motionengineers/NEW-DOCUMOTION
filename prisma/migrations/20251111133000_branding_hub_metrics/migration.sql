-- AlterTable
ALTER TABLE "Agency" ADD COLUMN "categories" TEXT;
ALTER TABLE "Agency" ADD COLUMN "serviceBadges" TEXT;
ALTER TABLE "Agency" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Agency" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Agency_city_idx" ON "Agency"("city");
CREATE INDEX "Agency_state_idx" ON "Agency"("state");
CREATE INDEX "Agency_verified_idx" ON "Agency"("verified");
CREATE INDEX "Agency_rating_idx" ON "Agency"("rating");
CREATE INDEX "Agency_minBudget_idx" ON "Agency"("minBudget");
CREATE INDEX "Agency_teamSize_idx" ON "Agency"("teamSize");

