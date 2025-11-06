import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signJwt } from "../../../../server/jwt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();
    if (!login || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signJwt({ id: user.id, login: user.login, role: user.role });
    const { passwordHash, ...publicUser } = user;

    return NextResponse.json({
      data: { access_token: token, user: publicUser },
    });
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
