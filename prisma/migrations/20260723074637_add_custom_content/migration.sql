-- CreateTable
CREATE TABLE "CustomContent" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
