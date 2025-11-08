// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.product.findMany({
    include: { productSizes: true },
    orderBy: { id: "asc" },
  });

  // ← infer types directly from the query result
  type ProductWithSizes = typeof items[number];
  type Size = ProductWithSizes["productSizes"][number];

  const data = items.map((p: ProductWithSizes) => {
    const sizes: Size[] = p.productSizes || [];

    // try to find size “s” (small)
    const byS: Size | undefined = sizes.find((s: Size) => s.key === "s");

    // find the cheapest size if no “s” exists
    const cheapest: Size | null =
      sizes.length > 0
        ? sizes.reduce(
            (min: Size, s: Size) => (s.priceCents < min.priceCents ? s : min),
            sizes[0]
          )
        : null;

    // define the default size: prefer “s”, otherwise the cheapest
    const def: Size | null = byS || cheapest || null;

    return {
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      category: p.category,
      image: p.image ?? null,
      sizes: sizes.map((s: Size) => ({
        key: s.key,
        label: s.label ?? null,
        priceCents: s.priceCents,
        discountPriceCents: s.discountPriceCents ?? null,
      })),
      defaultSizeKey: def?.key ?? null,
      priceCents: def?.priceCents ?? p.priceCents,
      discountPriceCents:
        def?.discountPriceCents ?? p.discountPriceCents ?? null,
    };
  });

  return NextResponse.json({ data });
}
