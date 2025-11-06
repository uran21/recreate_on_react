-- CreateTable
CREATE TABLE "ProductSize" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT,
    "priceCents" INTEGER NOT NULL,
    "discountPriceCents" INTEGER,
    CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Additive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "discountPriceCents" INTEGER
);

-- CreateTable
CREATE TABLE "ProductAdditive" (
    "productId" INTEGER NOT NULL,
    "additiveId" INTEGER NOT NULL,

    PRIMARY KEY ("productId", "additiveId"),
    CONSTRAINT "ProductAdditive_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductAdditive_additiveId_fkey" FOREIGN KEY ("additiveId") REFERENCES "Additive" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_key_key" ON "ProductSize"("productId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Additive_name_key" ON "Additive"("name");
