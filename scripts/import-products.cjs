/* eslint-disable no-console */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// База API берётся из .env.local/NEXT_PUBLIC_API_BASE_URL, либо дефолт как у тебя сейчас
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://coffee-shop-be.eu-central-1.elasticbeanstalk.com")
    .replace(/\/+$/, "");

const PRODUCTS_URL = `${API_BASE}/products`;

function toCents(str) {
  if (str == null) return null;
  const n = Number(String(str).replace(/\s+/g, "").replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function categoryImage(category, index) {
  const pools = {
    coffee: ["/assets/menu/coffee-1.svg", "/assets/menu/coffee-2.svg", "/assets/menu/coffee-3.svg"],
    tea: ["/assets/menu/tea-1.svg", "/assets/menu/tea-2.svg", "/assets/menu/tea-3.svg"],
    dessert: ["/assets/menu/dessert-1.svg", "/assets/menu/dessert-2.svg", "/assets/menu/dessert-3.svg"],
  };
  const list = pools[category] || pools.coffee;
  return list[index % list.length];
}

async function fetchProducts() {
  const res = await fetch(PRODUCTS_URL, { headers: { accept: "application/json" } });
  const json = await res.json();
  if (!res.ok) {
    const msg = (json && json.error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return Array.isArray(json?.data) ? json.data : [];
}

async function upsertByName(p, idx) {
  // приводи под твою схему Prisma:
  // name, description, category (String), image (String?),
  // priceCents (Int), discountPriceCents (Int?), sizesJson (String?), additivesJson (String?), isAvailable (Bool)
  const data = {
    name: p.name,
    description: p.description,
    category: p.category,
    image: categoryImage(p.category, idx),
    priceCents: toCents(p.price) ?? 0,
    discountPriceCents: toCents(p.discountPrice),
    sizesJson: JSON.stringify(["s", "m", "l"]),
    additivesJson: JSON.stringify(["Sugar", "Cinnamon", "Syrup"]),
    isAvailable: true,
  };

  // update по name (если name уникален — отлично; если нет, просто будет updateMany с count=0)
  const updated = await prisma.product.updateMany({
    where: { name: p.name },
    data,
  });

  if (updated.count === 0) {
    await prisma.product.create({ data });
    return "created";
  } else {
    return "updated";
  }
}

async function main() {
  console.log("→ Fetching:", PRODUCTS_URL);
  const list = await fetchProducts();
  console.log(`→ Received ${list.length} products`);

  let created = 0, updated = 0, failed = 0;
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    try {
      const action = await upsertByName(p, i);
      if (action === "created") created++;
      else updated++;
    } catch (e) {
      failed++;
      console.error(`✗ ${p?.name || "unknown"}:`, e.message);
    }
  }

  console.log(`✔ Done. Created: ${created}, Updated: ${updated}, Failed: ${failed}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
