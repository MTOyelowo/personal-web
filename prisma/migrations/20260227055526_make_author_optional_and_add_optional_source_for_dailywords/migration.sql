-- AlterTable
ALTER TABLE "daily_words" ADD COLUMN     "source" TEXT,
ALTER COLUMN "author" DROP NOT NULL;
