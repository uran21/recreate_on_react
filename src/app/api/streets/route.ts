import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const cityIdStr = req.nextUrl.searchParams.get("cityId");
  const cityId = Number(cityIdStr);
  if (!cityId || Number.isNaN(cityId)) {
    return NextResponse.json({ error: "cityId is required" }, { status: 400 });
  }
  const streets = await prisma.street.findMany({
    where: { cityId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: streets });
}
