-- CreateEnum
CREATE TYPE "TopicPrivacy" AS ENUM ('private', 'unlisted', 'public');

-- CreateEnum
CREATE TYPE "ItemPlacement" AS ENUM ('unranked', 'ranked');

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "privacy" "TopicPrivacy" NOT NULL DEFAULT 'unlisted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverKey" TEXT,
    "placement" "ItemPlacement" NOT NULL,
    "rankPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_shareId_key" ON "Topic"("shareId");

-- CreateIndex
CREATE INDEX "Topic_ownerId_idx" ON "Topic"("ownerId");

-- CreateIndex
CREATE INDEX "Item_topicId_placement_rankPosition_idx" ON "Item"("topicId", "placement", "rankPosition");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
