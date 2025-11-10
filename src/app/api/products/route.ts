import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.product.findMany({
    include: { productSizes: true },
    orderBy: { id: "asc" },
  });

  type ProductWithSizes = (typeof items)[number];
  type Size = ProductWithSizes["productSizes"][number];

  const data = items.map((p: ProductWithSizes) => {
    const sizes: Size[] = p.productSizes || [];

    const byS: Size | undefined = sizes.find((s: Size) => s.key === "s");

    const cheapest: Size | null =
      sizes.length > 0
        ? sizes.reduce(
            (min: Size, s: Size) => (s.priceCents < min.priceCents ? s : min),
            sizes[0]
          )
        : null;

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
