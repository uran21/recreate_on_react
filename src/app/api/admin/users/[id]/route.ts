import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt, type JwtPayload } from "@/server/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}
function bad(msg = "Bad request", code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}
function ok(data: any, message = "OK", status = 200) {
  return NextResponse.json({ data, message, error: null }, { status });
}

// --- helpers ---
async function getId(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Next 15/16: params — Promise
  try {
    const { id } = await ctx.params;
    const n = Number(id);
    if (Number.isInteger(n) && n > 0) return n;
  } catch {
    /* ignore */
  }
  // fallback по URL
  const m = req.nextUrl.pathname.match(/\/api\/admin\/users\/(\d+)(?:\/)?$/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isInteger(n) && n > 0) return n;
  }
  return null;
}

function requireAdmin(req: NextRequest): JwtPayload | null {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const payload = (token ? verifyJwt(token) : null) as JwtPayload | null;
  if (!payload) return null;
  if ((payload.role || "").toLowerCase() !== "admin") return null;
  return payload;
}

// --- PATCH ---
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const me = requireAdmin(req);
  if (!me) return forbid();

  const id = await getId(req, ctx);
  if (id == null) return bad("Invalid ID", 400);

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
    // простой пример валидации — при необходимости подправь под свои правила
    const okPass = /^(?=.*[^\w\s]).{6,}$/.test(password);
    if (!okPass) return bad("Invalid password", 400);
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      include: { city: true, street: true },
    });

    return ok(
      {
        user: {
          id: updated.id,
          login: updated.login,
          role: updated.role,
          city: updated.city?.name ?? null,
          street: updated.street?.name ?? null,
          houseNumber: updated.houseNumber ?? null,
          paymentMethod: updated.paymentMethod ?? null,
          createdAt: updated.createdAt?.toISOString?.() ?? null,
        },
      },
      "Updated"
    );
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return bad("User not found", 404);
    }
    console.error("PATCH /admin/users/:id failed", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// --- DELETE ---
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const me = requireAdmin(req);
  if (!me) return forbid();

  const id = await getId(req, ctx);
  if (id == null) return bad("Invalid ID", 400);

  if (me.id === id) return bad("You cannot delete your own account", 409);

  try {
    await prisma.user.delete({ where: { id } });
    return ok({ id }, "Deleted");
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return bad("User not found", 404);
    }
    console.error("DELETE /admin/users/:id failed", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
