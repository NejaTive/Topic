-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('pending', 'accepted', 'dismissed');

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "sourceItemId" TEXT,
    "title" TEXT NOT NULL,
    "coverKey" TEXT,
    "category" "TopicCategory" NOT NULL,
    "meta" JSONB,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recommendation_toUserId_status_createdAt_idx" ON "Recommendation"("toUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_fromUserId_idx" ON "Recommendation"("fromUserId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
