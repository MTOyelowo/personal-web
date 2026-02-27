-- CreateTable
CREATE TABLE "daily_words" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "commentary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_word_backgrounds" (
    "id" TEXT NOT NULL,
    "dailyWordId" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_word_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_words_date_key" ON "daily_words"("date");

-- CreateIndex
CREATE INDEX "daily_words_date_idx" ON "daily_words"("date");

-- CreateIndex
CREATE INDEX "daily_word_backgrounds_dailyWordId_idx" ON "daily_word_backgrounds"("dailyWordId");

-- AddForeignKey
ALTER TABLE "daily_word_backgrounds" ADD CONSTRAINT "daily_word_backgrounds_dailyWordId_fkey" FOREIGN KEY ("dailyWordId") REFERENCES "daily_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
