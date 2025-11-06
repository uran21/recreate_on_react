// scripts/scrape-legacy.ts
/* eslint-disable no-console */
import fs from "node:fs/promises";

const LOCAL = process.env.LOCAL_BASE || "http://localhost:3000";
const LEGACY = process.env.COFFEE_BASE || "http://coffee-shop-be.eu-central-1.elasticbeanstalk.com";
const OUT = process.env.OUT || "./prisma/legacy-details.json";
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);

type ListItem = { id: number; name: string; category: string };
type LegacyDetail = {
  data?: {
    id: number;
    name: string;
    description?: string;
    price?: string;
    discountPrice?: string | null;
    category: string;
    sizes?: any;
    additives?: any[];
    images?: string[];
  };
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchJSON<T>(url: string, retry = 2): Promise<T> {
  for (let i = 0; i <= retry; i++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return (await res.json()) as T;
    } catch (e) {
      if (i === retry) throw e;
      await sleep(200 + i * 300);
    }
  }
  // @ts-expect-error
  return null;
}

async function main() {
  console.log(`[scrape] LOCAL=${LOCAL}`);
  console.log(`[scrape] LEGACY=${LEGACY}`);
  console.log(`[scrape] OUT=${OUT}`);

  // 1) получаем список id из локального API (Prisma)
  const listRes = await fetchJSON<{ data: ListItem[] }>(`${LOCAL}/api/products`);
  const ids = (listRes?.data ?? []).map(x => x.id);
  if (!ids.length) {
    console.error("Нет товаров в /api/products");
    process.exit(1);
  }
  console.log(`[scrape] Всего id: ${ids.length}`);

  // 2) грёбём детали с legacy по батчам
  const results: Record<number, any> = {};
  let done = 0;

  const queue = [...ids];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const id = queue.shift()!;
      try {
        const detail = await fetchJSON<LegacyDetail>(`${LEGACY}/products/${id}`);
        const payload = detail?.data ?? null;
        if (payload) {
          results[id] = {
            id: payload.id,
            sizes: payload.sizes ?? null,
            additives: payload.additives ?? [],
            images: payload.images ?? [],
          };
        } else {
          results[id] = { id, sizes: null, additives: [], images: [] };
        }
      } catch {
        results[id] = { id, sizes: null, additives: [], images: [] }; // 404/ошибка сети
      } finally {
        done++;
        if (done % 10 === 0 || done === ids.length) {
          process.stdout.write(`\r[scrape] ${done}/${ids.length} готово`);
        }
      }
      await sleep(50);
    }
  });

  await Promise.all(workers);
  process.stdout.write("\n");

  // 3) сохраняем JSON
  const sorted = Object.fromEntries(
    Object.entries(results).sort((a, b) => Number(a[0]) - Number(b[0]))
  );
  await fs.mkdir(require("node:path").dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(sorted, null, 2), "utf8");

  console.log(`[scrape] Сохранено в ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
