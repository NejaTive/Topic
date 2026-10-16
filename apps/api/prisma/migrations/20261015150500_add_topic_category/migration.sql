-- CreateEnum
CREATE TYPE "TopicCategory" AS ENUM ('movies', 'custom');

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN "category" "TopicCategory" NOT NULL DEFAULT 'custom';
