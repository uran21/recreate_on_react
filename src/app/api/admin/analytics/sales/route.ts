import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";

export async function GET(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  const me = verifyJwt(token);
  if (!me) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  if ((me.role||"").toLowerCase()!=="admin") return NextResponse.json({ error:"Forbidden" }, { status:403 });

  // сумма продаж по дням (последние 30 дней)
  const since = new Date(Date.now() - 30*24*3600*1000);
  const rows = await prisma.$queryRaw<{day:string,total:number}[]>`
    SELECT strftime('%Y-%m-%d', createdAt) AS day, SUM(totalCents) AS total
    FROM "Order"
    WHERE createdAt >= ${since.toISOString()}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  // топ-товары
  const top = await prisma.$queryRaw<{name:string, qty:number, revenue:number}[]>`
    SELECT p.name AS name, SUM(oi.quantity) AS qty, SUM(oi.unitCents*oi.quantity) AS revenue
    FROM OrderItem oi
    JOIN Product p ON p.id = oi.productId
    GROUP BY p.name
    ORDER BY revenue DESC
    LIMIT 10
  `;

  return NextResponse.json({
    data: {
      byDay: rows.map(r=>({ day: r.day, totalCents: Number(r.total||0) })),
      topProducts: top.map(t=>({ name: t.name, qty: Number(t.qty||0), revenueCents: Number(t.revenue||0) })),
    }, message:"OK", error:null
  });
}
