-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cityId" INTEGER,
    "streetId" INTEGER,
    "houseNumber" INTEGER,
    "paymentMethod" TEXT DEFAULT 'card',
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("cityId", "createdAt", "houseNumber", "id", "login", "passwordHash", "paymentMethod", "role", "streetId") SELECT "cityId", "createdAt", "houseNumber", "id", "login", "passwordHash", "paymentMethod", "role", "streetId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
