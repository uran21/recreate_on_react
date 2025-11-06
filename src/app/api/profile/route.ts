import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // или "../db" — подстрой под свой проект
import { verifyJwt } from "@/server/jwt";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { city: true, street: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        city: user.city?.name ?? "",
        street: user.street?.name ?? "",
        houseNumber: user.houseNumber ?? null,
        paymentMethod: user.paymentMethod ?? "cash",
      },
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
