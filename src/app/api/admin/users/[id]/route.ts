import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
function bad(msg="Bad request") {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  const me = verifyJwt(token);
  if (!me) return unauthorized();
  if ((me.role||"").toLowerCase()!=="admin") return forbidden();

  const id = Number(ctx.params.id);
  if (!id) return bad("Invalid id");

  const body = await req.json().catch(()=> ({}));
  const data: any = {};
  if (typeof body.role === "string") data.role = body.role;
  if (typeof body.paymentMethod === "string" || body.paymentMethod === null) data.paymentMethod = body.paymentMethod;

  if (!Object.keys(data).length) return bad("Nothing to update");

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ data: { id: updated.id }, message:"Updated", error:null });
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  const me = verifyJwt(token);
  if (!me) return unauthorized();
  if ((me.role||"").toLowerCase()!=="admin") return forbidden();

  const id = Number(ctx.params.id);
  if (!id) return bad("Invalid id");

  // каскад удалит Order -> OrderItem
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ data: { id }, message:"Deleted", error:null });
}
