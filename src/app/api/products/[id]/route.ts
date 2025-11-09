// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

type DbProduct = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  discountPriceCents: number | null;
  category: string;
  image: string | null;
  sizesJson: string | null;
  additivesJson: string | null;
};
type DbSize = {
  key: string;
  label: string | null;
  priceCents: number;
  discountPriceCents: number | null;
};
type DbAdditive = {
  name: string;
  priceCents: number;
  discountPriceCents: number | null;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let idStr: string | undefined;
  try {
    const p = await params;
    idStr = p?.id;
  } catch {}
  if (!idStr) {
    const m = req.nextUrl.pathname.match(/\/api\/products\/(\d+)\/?$/);
    if (m) idStr = m[1];
  }
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // 🔧 ПРОДУКТ — все идентификаторы в двойных кавычках
  const prodRows = await prisma.$queryRaw<DbProduct[]>`
    SELECT "id","name","description","priceCents","discountPriceCents","category","image","sizesJson","additivesJson"
    FROM "Product"
    WHERE "id" = ${id}
    LIMIT 1
  `;
  if (!prodRows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const p: DbProduct = prodRows[0];

  // 🔧 SIZES — тоже кавычки
  let sizes: Record<
    string,
    { size: string | null; price: string; discountPrice: string | null }
  > | null = null;

  try {
    const sizeRows = await prisma.$queryRaw<DbSize[]>`
      SELECT "key","label","priceCents","discountPriceCents"
      FROM "ProductSize"
      WHERE "productId" = ${id}
      ORDER BY "key" ASC
    `;
    if (sizeRows.length) {
      sizes = Object.fromEntries(
        sizeRows.map((s: DbSize) => [
          s.key,
          {
            size: s.label ?? null,
            price: (s.priceCents / 100).toFixed(2),
            discountPrice:
              s.discountPriceCents != null
                ? (s.discountPriceCents / 100).toFixed(2)
                : null,
          },
        ])
      );
    } else if (p.sizesJson) {
      try {
        sizes = JSON.parse(p.sizesJson);
      } catch {
        sizes = null;
      }
    }
  } catch {
    if (p.sizesJson) {
      try {
        sizes = JSON.parse(p.sizesJson);
      } catch {
        sizes = null;
      }
    }
  }

  // 🔧 ADDITIVES — кавычки на таблицах/полях
  let additives: Array<{
    name: string;
    price: string;
    discountPrice: string | null;
  }> = [];
  try {
    const addRows = await prisma.$queryRaw<DbAdditive[]>`
      SELECT a."name", a."priceCents", a."discountPriceCents"
      FROM "ProductAdditive" pa
      JOIN "Additive" a ON a."id" = pa."additiveId"
      WHERE pa."productId" = ${id}
      ORDER BY a."id" ASC
    `;
    if (addRows.length) {
      additives = addRows.map((a: DbAdditive) => ({
        name: a.name,
        price: (a.priceCents / 100).toFixed(2),
        discountPrice:
          a.discountPriceCents != null
            ? (a.discountPriceCents / 100).toFixed(2)
            : null,
      }));
    } else if (p.additivesJson) {
      try {
        additives = JSON.parse(p.additivesJson);
      } catch {
        additives = [];
      }
    }
  } catch {
    if (p.additivesJson) {
      try {
        additives = JSON.parse(p.additivesJson);
      } catch {
        additives = [];
      }
    }
  }

  return NextResponse.json({
    data: {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: (p.priceCents / 100).toFixed(2),
      discountPrice:
        p.discountPriceCents != null
          ? (p.discountPriceCents / 100).toFixed(2)
          : null,
      category: p.category,
      image: p.image,
      images: [],
      sizes,
      additives,
    },
    message: "OK",
    error: null,
  });
}
