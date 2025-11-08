import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, type JwtPayload } from "@/server/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // на всякий случай

function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}
function bad(msg = "Bad request", code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}
function ok(data: any, message = "OK", status = 200) {
  return NextResponse.json({ data, message, error: null }, { status });
}

// Универсальный разбор любого "сырого" id
function toValidId(v: unknown): number | null {
  if (typeof v === "number") {
    return Number.isInteger(v) && v > 0 ? v : null;
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d+$/.test(s)) {
      const n = Number.parseInt(s, 10);
      return Number.isInteger(n) && n > 0 ? n : null;
    }
  }
  return null;
}

// Достаём id либо из params, либо из URL
function extractId(req: Request, ctx: { params?: { id?: unknown } }): number | null {
  const fromParams = toValidId(ctx?.params?.id);
  if (fromParams) return fromParams;

  try {
    const url = new URL(req.url);
    // ожидаем путь вида /api/admin/users/123
    const m = url.pathname.match(/\/api\/admin\/users\/(\d+)(?:\/)?$/);
    if (m && m[1]) {
      const n = Number.parseInt(m[1], 10);
      return Number.isInteger(n) && n > 0 ? n : null;
    }
  } catch {}
  return null;
}

type Ctx = { params?: { id?: unknown } };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = (token ? verifyJwt(token) : null) as JwtPayload | null;
  if (!payload || (payload.role || "").toLowerCase() !== "admin") return forbid();

  const id = extractId(req, ctx);
  if (id === null) {
    console.error("PATCH /admin/users/:id invalid id", { params: ctx?.params, url: req.url });
    return bad("Invalid ID", 400);
  }

  const body = await req.json().catch(() => ({}));
  const { role, paymentMethod, password } = body as {
    role?: string;
    paymentMethod?: string | null;
    password?: string;
  };

  const data: Record<string, any> = {};
  if (typeof role === "string" && role.trim()) data.role = role.trim();
  if (typeof paymentMethod === "string") data.paymentMethod = paymentMethod.trim() || null;

  if (typeof password === "string" && password.length) {
    const rePassword = /^(?=.*[^\w\s]).{6,}$/;
    if (!rePassword.test(password)) return bad("Invalid password", 400);
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      include: { city: true, street: true },
    });

    return ok({
      user: {
        id: updated.id,
        login: updated.login,
        role: updated.role,
        city: updated.city?.name ?? null,
        street: updated.street?.name ?? null,
        houseNumber: updated.houseNumber ?? null,
        paymentMethod: updated.paymentMethod ?? null,
        createdAt: updated.createdAt.toISOString(),
      },
    }, "Updated");
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return bad("User not found", 404);
    }
    console.error("PATCH /admin/users/:id failed", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = (token ? verifyJwt(token) : null) as JwtPayload | null;
  if (!payload || (payload.role || "").toLowerCase() !== "admin") return forbid();

  const id = extractId(req, ctx);
  if (id === null) {
    console.error("DELETE /admin/users/:id invalid id", { params: ctx?.params, url: req.url });
    return bad("Invalid ID", 400);
  }

  if (payload.id === id) return bad("You cannot delete your own account", 409);

  try {
    await prisma.user.delete({ where: { id } });
    return ok({ id }, "Deleted");
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return bad("User not found", 404);
    }
    console.error("DELETE /admin/users/:id failed", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
