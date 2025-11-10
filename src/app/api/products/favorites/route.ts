import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const toMoney = (c: number | null | undefined) =>
  c == null ? null : (c / 100).toFixed(2);

export async function GET() {
  try {
    const favoriteNames = [
      "Ice cappuccino",
      "Coffee with cognac",
      "Irish coffee",
    ];

    const rows = await prisma.product.findMany({
      where: { name: { in: favoriteNames } },
    });

    const ordered = favoriteNames
      .map((name) => rows.find((r) => r.name === name))
      .filter(Boolean)
      .map((r) => ({
        id: r!.id,
        name: r!.name,
        description: r!.description,
        category: r!.category,
        price: toMoney(r!.priceCents)!,                 
        discountPrice: toMoney(r!.discountPriceCents),  
      }));

    return NextResponse.json({ data: ordered, message: "", error: "" });
  } catch (e: any) {
    return NextResponse.json(
      { data: [], message: "", error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
