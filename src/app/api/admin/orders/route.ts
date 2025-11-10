import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth-server";

export const runtime = "nodejs";

function startOfDayUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
}
function dayKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const user = requireUser(req);
    if ((user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const days = Math.max(
      1,
      Math.min(10, Number(url.searchParams.get("days")) || 3)
    );
    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? new Date(cursorRaw) : new Date();
    if (isNaN(cursor.getTime())) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const chunk = await prisma.order.findMany({
      where: { createdAt: { lt: cursor } },
      orderBy: { createdAt: "desc" },
      take: 800,
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

    type DayBucket = {
      dayIso: string;
      totalCents: number;
      orders: any[];
    };
    const buckets: Record<string, DayBucket> = {};
    const dayOrder: string[] = [];

    for (const o of chunk) {
      const k = dayKeyUTC(o.createdAt);
      if (!buckets[k]) {
        if (dayOrder.length >= days) break;
        buckets[k] = { dayIso: k, totalCents: 0, orders: [] };
        dayOrder.push(k);
      }
      buckets[k].orders.push({
        ...o,
        customer: o.customer && {
          id: o.customer.id,
          login: o.customer.login,
          city: o.customer.city?.name ?? null,
          street: o.customer.street?.name ?? null,
          houseNumber: o.customer.houseNumber ?? null,
          paymentMethod: o.customer.paymentMethod ?? null,
        },
      });
      buckets[k].totalCents += o.totalCents;
    }

    const daysOut = dayOrder.map((k) => buckets[k]);

    let nextBefore: string | null = null;
    let hasMore = false;
    if (dayOrder.length > 0) {
      const oldestDayIso = dayOrder[dayOrder.length - 1];
      const [y, m, d] = oldestDayIso.split("-").map(Number);
      const oldestDayStart = new Date(
        Date.UTC(y, (m as number) - 1, d as number, 0, 0, 0, 0)
      );

      const prevDayStart = new Date(
        oldestDayStart.getTime() - 24 * 60 * 60 * 1000
      );
      nextBefore = prevDayStart.toISOString();

      const more = await prisma.order.findFirst({
        where: { createdAt: { lt: prevDayStart } },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });
      hasMore = !!more;
    }

    return NextResponse.json({
      data: { days: daysOut, nextBefore, hasMore },
      message: "OK",
      error: null,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("GET /api/admin/orders error:", e);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
