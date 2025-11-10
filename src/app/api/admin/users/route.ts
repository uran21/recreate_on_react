import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";
import bcrypt from "bcryptjs";

function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}
function bad(msg = "Bad request", code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

type UserDTO = {
  id: number;
  login: string;
  role: string;
  city: string | null;
  street: string | null;
  houseNumber: number | null;
  paymentMethod: string | null;
  createdAt: string | null;
};

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = token ? (verifyJwt(token) as { role?: string } | null) : null;
  if (!payload || (payload.role || "").toLowerCase() !== "admin") {
    return forbid();
  }

  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    include: { city: true, street: true },
  });

  type UserWithRefs = typeof users[number]; 
  const out: UserDTO[] = users.map((u: UserWithRefs) => ({
    id: u.id,
    login: u.login,
    role: u.role,
    city: u.city?.name ?? null,
    street: u.street?.name ?? null,
    houseNumber: u.houseNumber ?? null,
    paymentMethod: u.paymentMethod ?? null,
    createdAt: u.createdAt?.toISOString?.() ?? null,
  }));

  return NextResponse.json({
    data: { users: out },
    message: "OK",
    error: null,
  });
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = token ? (verifyJwt(token) as { role?: string } | null) : null;
  if (!payload || (payload.role || "").toLowerCase() !== "admin") {
    return forbid();
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const { login, password, role = "user", paymentMethod = "card" } = body as {
    login: string;
    password: string;
    role?: string;
    paymentMethod?: string;
  };

  const reLogin = /^[A-Za-z][A-Za-z0-9]{2,}$/;
  const rePassword = /^(?=.*[^\w\s]).{6,}$/;
  if (!reLogin.test(String(login || ""))) return bad("Invalid login");
  if (!rePassword.test(String(password || ""))) return bad("Invalid password");

  try {
    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        login: String(login),
        passwordHash: hash,
        role: String(role || "user"),
        paymentMethod: String(paymentMethod || "card"),
      },
      include: { city: true, street: true },
    });

    const user: UserDTO = {
      id: created.id,
      login: created.login,
      role: created.role,
      city: created.city?.name ?? null,
      street: created.street?.name ?? null,
      houseNumber: created.houseNumber ?? null,
      paymentMethod: created.paymentMethod ?? null,
      createdAt: created.createdAt?.toISOString?.() ?? null,
    };

    return NextResponse.json(
      { data: { user }, message: "Created", error: null },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique/i.test(msg)) {
      return NextResponse.json(
        { error: "Login already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
