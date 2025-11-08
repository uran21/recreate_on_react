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
  // YYYY-MM-DD по UTC (удобно и стабильно для сервера)
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
    ); // 1..10
    const cursorRaw = url.searchParams.get("cursor"); // ISO-строка или null
    const cursor = cursorRaw ? new Date(cursorRaw) : new Date();
    if (isNaN(cursor.getTime())) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    // Берём достаточно заказов "в запас" (например, 800), чтобы точно набрать 3 дня
    // При необходимости увеличь/уменьши take под свои объёмы.
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

    // Группируем по дате (UTC) и берём не более N разных дат
    type DayBucket = {
      dayIso: string; // YYYY-MM-DD (UTC)
      totalCents: number;
      orders: any[];
    };
    const buckets: Record<string, DayBucket> = {};
    const dayOrder: string[] = [];

    for (const o of chunk) {
      const k = dayKeyUTC(o.createdAt);
      if (!buckets[k]) {
        if (dayOrder.length >= days) break; // уже набрали нужное кол-во дат
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

    // Сформируем nextBefore: это 00:00 UTC дня, который идёт ПЕРЕД самым старым из выданных
    let nextBefore: string | null = null;
    let hasMore = false;
    if (dayOrder.length > 0) {
      const oldestDayIso = dayOrder[dayOrder.length - 1]; // последний в списке — самый старый день
      const [y, m, d] = oldestDayIso.split("-").map(Number);
      const oldestDayStart = new Date(
        Date.UTC(y, (m as number) - 1, d as number, 0, 0, 0, 0)
      );
      // следующий курсор — начало суток ещё на день раньше
      const prevDayStart = new Date(
        oldestDayStart.getTime() - 24 * 60 * 60 * 1000
      );
      nextBefore = prevDayStart.toISOString();

      // Проверяем, есть ли ещё заказы раньше prevDayStart
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
