// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.product.findMany({
    include: { productSizes: true },
    orderBy: { id: "asc" },
  });

  const data = items.map((p) => {
    const sizes = p.productSizes || [];
    // стратегия дефолта: сначала ищем 's', если нет — берём самый дешёвый
    const byS = sizes.find((s) => s.key === "s");
    const cheapest =
      sizes.length > 0
        ? sizes.reduce((min, s) => (s.priceCents < min.priceCents ? s : min), sizes[0])
        : null;
    const def = byS || cheapest;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      image: p.image,
      sizes: sizes.map((s) => ({
        key: s.key,
        label: s.label,
        priceCents: s.priceCents,
        discountPriceCents: s.discountPriceCents ?? null,
      })),
      // ВЫРАВНИВАЕМ list-цену с модалкой:
      defaultSizeKey: def?.key ?? null,
      priceCents: def?.priceCents ?? p.priceCents, // карточка будет показывать эту цену
      discountPriceCents: def?.discountPriceCents ?? p.discountPriceCents ?? null,
    };
  });

  return NextResponse.json({ data });
}
