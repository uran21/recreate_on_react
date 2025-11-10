// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-server";

export const runtime = "nodejs";

type PlaceOrderPayload = {
  items: Array<{
    productId: number;
    quantity: number;
    size?: string;           
    additives?: string[];    
  }>;
};


const int = (v: any) => (Number.isFinite(+v) ? Math.trunc(+v) : 0);

export async function POST(req: Request) {
  try {
    const user = requireUser(req); 

    const body = (await req.json()) as PlaceOrderPayload;
    if (!body?.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

   
    const productIds = Array.from(new Set(body.items.map(i => int(i.productId)))).filter(Boolean);
    const allAddNames = Array.from(
      new Set((body.items.flatMap(i => i.additives || [])).map(s => s.trim()).filter(Boolean))
    );

   
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
      select: {
        id: true,
        priceCents: true,
        discountPriceCents: true,
        category: true,
      },
    });
    const pById = new Map(products.map(p => [p.id, p]));

  
    const sizes = await prisma.productSize.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, key: true, priceCents: true, discountPriceCents: true, label: true },
    });
    const sizesByKey = new Map<string, { productId: number; key: string; priceCents: number; discountPriceCents: number | null; label: string | null }>();
    for (const s of sizes) sizesByKey.set(`${s.productId}:${s.key}`, s);

 
    const adds = allAddNames.length
      ? await prisma.additive.findMany({
          where: { name: { in: allAddNames } },
          select: { id: true, name: true, priceCents: true, discountPriceCents: true },
        })
      : [];
    const addByName = new Map(adds.map(a => [a.name, a]));

    const prodAddLinks = await prisma.productAdditive.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, additiveId: true },
    });
    const linkSet = new Set(prodAddLinks.map(l => `${l.productId}:${l.additiveId}`));


    let totalCents = 0;
    const orderItemsData: {
      productId: number;
      size: string;
      additivesJson: string;
      quantity: number;
      unitCents: number;
    }[] = [];

    for (const it of body.items) {
      const product = pById.get(int(it.productId));
      if (!product) continue;

   
      const sizeKey = (it.size || "").trim() || "s";
      const sKey = `${product.id}:${sizeKey}`;
      const sRow = sizesByKey.get(sKey);

      const reg = sRow ? sRow.priceCents : product.priceCents;
      const disc = sRow ? sRow.discountPriceCents : product.discountPriceCents;
      const unitBase = disc != null ? disc : reg; 

  
      const addNames = (it.additives || []).filter(Boolean);
      let addsSum = 0;
      const safeAddNames: string[] = [];
      for (const name of addNames) {
        const a = addByName.get(name);
        if (!a) continue;
        if (!linkSet.has(`${product.id}:${a.id}`)) continue; 
        const aPrice = a.discountPriceCents != null ? a.discountPriceCents : a.priceCents;
        addsSum += aPrice;
        safeAddNames.push(a.name);
      }

      const unitCents = unitBase + addsSum;
      const qty = Math.max(1, int(it.quantity));
      totalCents += unitCents * qty;

      orderItemsData.push({
        productId: product.id,
        size: sizeKey.toUpperCase(),
        additivesJson: JSON.stringify(safeAddNames),
        quantity: qty,
        unitCents,
      });
    }

    if (!orderItemsData.length) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        status: "NEW",
        totalCents,
        items: {
          createMany: { data: orderItemsData },
        },
      },
      select: { id: true, status: true, totalCents: true, createdAt: true },
    });

    return NextResponse.json({ data: order, message: "Created", error: null }, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("POST /api/orders error:", e);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = requireUser(req);

    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            size: true,
            additivesJson: true,
            quantity: true,
            unitCents: true,
            productId: true,
            product: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: { orders }, message: "OK", error: null });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("GET /api/orders error:", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
