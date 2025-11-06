import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // см. либу ниже

export async function GET() {
  const cities = await prisma.city.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: cities });
}
