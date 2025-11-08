import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";

export const runtime = "nodejs";

type TopProductOut = {
  category: string;
  name: string;
  qty: number;
  revenueCents: number;
};

export async function GET(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    ""
  );
  const me = verifyJwt(token);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((me.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const days = Math.max(
    1,
    Math.min(365, Number(url.searchParams.get("days")) || 30)
  ); // 1..365
  const perCategory = Math.max(
    1,
    Math.min(50, Number(url.searchParams.get("limit")) || 5)
  ); // топ-N в категории
  const since = new Date(Date.now() - days * 24 * 3600 * 1000);

  // Берём заказы за период с их позициями и продуктами
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: {
      items: {
        select: {
          quantity: true,
          unitCents: true,
          product: { select: { name: true, category: true } },
        },
      },
    },
  });

  // Аггрегируем в памяти: ключ = category|name
  const map = new Map<string, TopProductOut>();
  for (const o of orders) {
    for (const it of o.items) {
      const name = it.product?.name ?? "Unnamed";
      const category = it.product?.category ?? "Other";
      const key = `${category}|||${name}`;
      const prev = map.get(key) || { category, name, qty: 0, revenueCents: 0 };
      prev.qty += Number(it.quantity || 0);
      prev.revenueCents += Number(it.unitCents || 0) * Number(it.quantity || 0);
      map.set(key, prev);
    }
  }

  // Группируем по категории -> сортируем -> берём топ-N
  const byCat = new Map<string, TopProductOut[]>();
  for (const item of map.values()) {
    const cat = item.category || "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(item);
  }
  for (const [cat, arr] of byCat.entries()) {
    arr.sort((a, b) => b.revenueCents - a.revenueCents || b.qty - a.qty);
    byCat.set(cat, arr.slice(0, perCategory));
  }

  // В один плоский список (если на клиенте уже группируете — можно отправлять мапу)
  const topProducts: TopProductOut[] = [];
  for (const arr of byCat.values()) topProducts.push(...arr);

  return NextResponse.json({
    data: { topProducts },
    message: "OK",
    error: null,
  });
}
