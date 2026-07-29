-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- CreateTable
CREATE TABLE "VideoProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "episodeKey" TEXT,
    "progressSeconds" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseYear" INTEGER,
    "rating" REAL,
    "durationMinutes" INTEGER,
    "genres" TEXT,
    "type" TEXT NOT NULL,
    "seasons" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomContent" ("backdropPath", "createdAt", "durationMinutes", "genres", "id", "overview", "posterPath", "rating", "releaseYear", "seasons", "title", "type", "updatedAt") SELECT "backdropPath", "createdAt", "durationMinutes", "genres", "id", "overview", "posterPath", "rating", "releaseYear", "seasons", "title", "type", "updatedAt" FROM "CustomContent";
DROP TABLE "CustomContent";
ALTER TABLE "new_CustomContent" RENAME TO "CustomContent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
