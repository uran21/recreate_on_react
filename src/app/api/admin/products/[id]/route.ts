import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/server/jwt";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 30;

type Params = { params: { id: string } };
function forbid(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}
export async function DELETE(req: Request, { params }: Params) {
  const token = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    ""
  );
  const me = verifyJwt(token);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((me.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.productSize.deleteMany({ where: { productId: idNum } });
      await tx.product.delete({ where: { id: idNum } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("DELETE product error:", e);
    const msg = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
