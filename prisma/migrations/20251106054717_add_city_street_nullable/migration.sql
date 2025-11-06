/*
  Warnings:

  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_status_createdAt_idx";

-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Street" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    CONSTRAINT "Street_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cityId" INTEGER,
    "streetId" INTEGER,
    "houseNumber" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'card',
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "houseNumber", "id", "login", "passwordHash", "paymentMethod", "role") SELECT "createdAt", "houseNumber", "id", "login", "passwordHash", "paymentMethod", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Street_name_cityId_key" ON "Street"("name", "cityId");
