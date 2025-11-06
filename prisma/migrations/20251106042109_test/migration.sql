/*
  Warnings:

  - The primary key for the `ProductSize` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProductSize` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "discountPriceCents" INTEGER,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "sizesJson" TEXT,
    "additivesJson" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("additivesJson", "category", "createdAt", "description", "discountPriceCents", "id", "image", "isAvailable", "name", "priceCents", "sizesJson", "updatedAt") SELECT "additivesJson", "category", "createdAt", "description", "discountPriceCents", "id", "image", "isAvailable", "name", "priceCents", "sizesJson", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductAdditive" (
    "productId" INTEGER NOT NULL,
    "additiveId" INTEGER NOT NULL,

    PRIMARY KEY ("productId", "additiveId"),
    CONSTRAINT "ProductAdditive_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductAdditive_additiveId_fkey" FOREIGN KEY ("additiveId") REFERENCES "Additive" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductAdditive" ("additiveId", "productId") SELECT "additiveId", "productId" FROM "ProductAdditive";
DROP TABLE "ProductAdditive";
ALTER TABLE "new_ProductAdditive" RENAME TO "ProductAdditive";
CREATE TABLE "new_ProductSize" (
    "productId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT,
    "priceCents" INTEGER NOT NULL,
    "discountPriceCents" INTEGER,

    PRIMARY KEY ("productId", "key"),
    CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductSize" ("discountPriceCents", "key", "label", "priceCents", "productId") SELECT "discountPriceCents", "key", "label", "priceCents", "productId" FROM "ProductSize";
DROP TABLE "ProductSize";
ALTER TABLE "new_ProductSize" RENAME TO "ProductSize";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
