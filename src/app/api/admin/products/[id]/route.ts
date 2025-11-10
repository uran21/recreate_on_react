import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";

export const runtime = "nodejs";
export const maxDuration = 30;

function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}
function bad(msg = "Bad request") {
  return NextResponse.json({ error: msg }, { status: 400 });
}
function requireAdmin(req: NextRequest) {
  const token = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    ""
  );
  const me = verifyJwt(token);
  if (!me)
    return {
      ok: false as const,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  if ((me.role || "").toLowerCase() !== "admin")
    return { ok: false as const, res: forbid() };
  return { ok: true as const };
}

async function readId(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<number | null> {
  try {
    const p = await context.params;
    const n = Number(p?.id);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    /* ignore */
  }
  const m = req.nextUrl.pathname.match(/\/api\/admin\/users\/(\d+)\/?$/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adm = requireAdmin(req);
  if (!adm.ok) return adm.res;

  const id = await readId(req, context);
  if (id == null) return bad("Bad id");

  const u = await prisma.user.findUnique({
    where: { id },
    include: { city: true, street: true },
  });
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      id: u.id,
      login: u.login,
      role: u.role,
      city: u.city?.name ?? null,
      street: u.street?.name ?? null,
      houseNumber: u.houseNumber ?? null,
      paymentMethod: u.paymentMethod ?? null,
      createdAt: u.createdAt?.toISOString?.() ?? null,
    },
    message: "OK",
    error: null,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adm = requireAdmin(req);
  if (!adm.ok) return adm.res;

  const id = await readId(req, context);
  if (id == null) return bad("Bad id");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  type UpdateData = Parameters<typeof prisma.user.update>[0] extends {
    data: infer D;
  }
    ? D
    : never;
  const data = {} as UpdateData;

  if (typeof body.role === "string") (data as any).role = body.role;
  if (typeof body.paymentMethod === "string")
    (data as any).paymentMethod = body.paymentMethod;
  if (Number.isFinite(Number(body.houseNumber)))
    (data as any).houseNumber = Number(body.houseNumber);

  if (Number.isFinite(Number(body.cityId))) {
    (data as any).city = { connect: { id: Number(body.cityId) } };
  }
  if (Number.isFinite(Number(body.streetId))) {
    (data as any).street = { connect: { id: Number(body.streetId) } };
  }

  try {
    const u = await prisma.user.update({
      where: { id },
      data,
      include: { city: true, street: true },
    });

    return NextResponse.json({
      data: {
        id: u.id,
        login: u.login,
        role: u.role,
        city: u.city?.name ?? null,
        street: u.street?.name ?? null,
        houseNumber: u.houseNumber ?? null,
        paymentMethod: u.paymentMethod ?? null,
        createdAt: u.createdAt?.toISOString?.() ?? null,
      },
      message: "Updated",
      error: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adm = requireAdmin(req);
  if (!adm.ok) return adm.res;

  const id = await readId(req, context);
  if (id == null) return bad("Bad id");

  try {
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
