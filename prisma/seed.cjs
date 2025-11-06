/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs/promises";

const prisma = new PrismaClient();

type LegacyMap = Record<string, {
  id: number;
  sizes?: Record<string, { size?: string; label?: string; price?: string; discountPrice?: string }>;
  additives?: Array<{ name?: string; title?: string; price?: string; discountPrice?: string }>;
  images?: string[];
}>;

const toCents = (s?: string | null) => {
  if (!s) return 0;
  const n = Number(String(s).replace(",", "."));
  return Math.round((isFinite(n) ? n : 0) * 100);
};

async function main() {
  const jsonPath = path.resolve(process.cwd(), "prisma", "legacy-details.json");
  const raw = await fs.readFile(jsonPath, "utf8");
  const legacy: LegacyMap = JSON.parse(raw);

  const ids = Object.keys(legacy).map(Number).sort((a, b) => a - b);
  console.log(`[seed] importing ${ids.length} products...`);

  for (const id of ids) {
    const entry = legacy[String(id)];
    if (!entry) continue;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      console.warn(`[seed] skip product ${id} (not in DB)`);
      continue;
    }

    // SIZES
    if (entry.sizes && typeof entry.sizes === "object") {
      for (const [keyRaw, sObj] of Object.entries(entry.sizes)) {
        const key = keyRaw.toLowerCase().trim(); // s/m/l/xl...
        const label = sObj?.size ?? sObj?.label ?? null;
        const priceCents = toCents(sObj?.price);
        const discountCents = sObj?.discountPrice ? toCents(sObj.discountPrice) : null;

        if (priceCents <= 0 && (discountCents ?? 0) <= 0) continue;

        await prisma.productSize.upsert({
          where: { productId_key: { productId: id, key } },
          create: {
            productId: id,
            key,
            label: label ?? undefined,
            priceCents,
            discountPriceCents: discountCents ?? undefined,
          },
          update: {
            label: label ?? undefined,
            priceCents,
            discountPriceCents: discountCents ?? undefined,
          },
        });
      }
    }

    // ADDITIVES
    if (Array.isArray(entry.additives)) {
      for (const ad of entry.additives) {
        const name = (ad?.name ?? ad?.title ?? "").trim();
        if (!name) continue;
        const priceCents = toCents(ad?.price);
        const discountCents = ad?.discountPrice ? toCents(ad.discountPrice) : null;

        const additive = await prisma.additive.upsert({
          where: { name },
          create: { name, priceCents, discountPriceCents: discountCents ?? undefined },
          update: { priceCents, discountPriceCents: discountCents ?? undefined },
        });

        await prisma.productAdditive.upsert({
          where: { productId_additiveId: { productId: id, additiveId: additive.id } },
          create: { productId: id, additiveId: additive.id },
          update: {},
        });
      }
    }
  }

  console.log("[seed] done");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
