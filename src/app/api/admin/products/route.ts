// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";
import type { Prisma } from "@prisma/client";

// Типы входных данных
type SizeIn = {
  key: "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  label: string | null;
  priceCents: number;
  discountPriceCents: number | null;
};

type BodyIn = {
  name: string;
  description: string | null;
  category: "coffee" | "tea" | "dessert";
  image: string | null; // ДОЛЖЕН начинаться с /assets/menu/
  isAvailable: boolean;
  sizes: SizeIn[];
  defaultSizeKey: SizeIn["key"] | null;
};

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}
function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const me = token ? verifyJwt(token) : null;
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((me.role || "").toLowerCase() !== "admin") return forbid();

    const body = (await req.json()) as BodyIn;

    // Валидации
    if (!body.name?.trim()) return bad("Name is required");
    if (!body.category || !["coffee", "tea", "dessert"].includes(body.category))
      return bad("Invalid category");

    const image = (body.image || "").trim();
    if (!image || !image.startsWith("/assets/menu/")) {
      return bad(
        "Image must be a path under /assets/menu/, e.g. /assets/menu/coffee-9.jpg"
      );
    }

    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      return bad("At least one size is required");
    }

    for (const s of body.sizes) {
      if (!s?.key) return bad("Each size must have a key");
      if (!["s", "m", "l", "xl", "xxl", "xxxl"].includes(s.key))
        return bad("Invalid size key");
      if (!(s.priceCents > 0)) return bad("priceCents must be > 0");
      if (s.discountPriceCents != null && s.discountPriceCents < 0)
        return bad("discountPriceCents must be >= 0");
    }

    // sizesJson в БД — массив ключей, напр. ["s","m","l"]
    const sizesJsonKeys = JSON.stringify(body.sizes.map((s) => s.key));

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 👈 типизируем tx
        const defaultSize =
          (body.defaultSizeKey &&
            body.sizes.find((s) => s.key === body.defaultSizeKey)) ||
          body.sizes.slice().sort((a, b) => a.priceCents - b.priceCents)[0];

        const product = await tx.product.create({
          data: {
            name: body.name.trim(),
            description: body.description?.trim() || null,
            priceCents: defaultSize.priceCents,
            discountPriceCents: defaultSize.discountPriceCents,
            category: body.category,
            image, // уже прошёл проверку на /assets/menu/
            sizesJson: sizesJsonKeys, // только массив ключей
            isAvailable: !!body.isAvailable,
          },
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            discountPriceCents: true,
            category: true,
            image: true,
            sizesJson: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Нормализованные размеры (деталка в ProductSize)
        await tx.productSize.createMany({
          data: body.sizes.map((s) => ({
            productId: product.id,
            key: s.key,
            label: s.label,
            priceCents: s.priceCents,
            discountPriceCents: s.discountPriceCents,
          })),
          // В вашей версии Prisma skipDuplicates может быть недоступен — не используем
        });

        return product;
      }
    );

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    // см. пункт (2)
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("Create product error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
