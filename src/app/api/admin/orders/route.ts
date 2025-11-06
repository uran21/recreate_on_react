// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = requireUser(req);
    if ((user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            login: true,
            city: { select: { name: true } },
            street: { select: { name: true } },
            houseNumber: true,
            paymentMethod: true,
          },
        },
        items: {
          select: {
            id: true,
            size: true,
            additivesJson: true,
            quantity: true,
            unitCents: true,
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Нормализуем адрес
    const norm = orders.map(o => ({
      ...o,
      customer: o.customer && {
        id: o.customer.id,
        login: o.customer.login,
        city: o.customer.city?.name,
        street: o.customer.street?.name,
        houseNumber: o.customer.houseNumber,
        paymentMethod: o.customer.paymentMethod,
      },
    }));

    return NextResponse.json({ data: { orders: norm }, message: "OK", error: null });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("GET /api/admin/orders error:", e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
