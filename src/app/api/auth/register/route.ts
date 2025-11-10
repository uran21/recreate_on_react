import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      login,
      password,
      cityId,
      streetId,
      houseNumber,
      paymentMethod, 
    } = body || {};

    if (!login || !password) {
      return NextResponse.json({ error: "login and password required" }, { status: 400 });
    }
    if (!cityId || !streetId || !houseNumber) {
      return NextResponse.json({ error: "cityId, streetId, houseNumber required" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { login } });
    if (exists) return NextResponse.json({ error: "Login already exists" }, { status: 409 });

    const street = await prisma.street.findFirst({
      where: { id: Number(streetId), cityId: Number(cityId) },
      include: { city: true },
    });
    if (!street) {
      return NextResponse.json({ error: "Invalid cityId/streetId" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        login,
        passwordHash,
        cityId: street.cityId,
        streetId: street.id,
        houseNumber: Number(houseNumber),
        paymentMethod: (paymentMethod === "cash" ? "cash" : "card"),
      },
      include: {
        city: true,
        street: true,
      },
    });


    const token = jwt.sign({ sub: user.id, login: user.login, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

        return NextResponse.json({
      data: {
        access_token: token,
        user: {
          id: user.id,
          login: user.login,
          cityId: user.cityId,
          streetId: user.streetId,
          city: user.city?.name,
          street: user.street?.name,
          houseNumber: user.houseNumber,
          paymentMethod: user.paymentMethod,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Register failed" }, { status: 500 });
  }
}
