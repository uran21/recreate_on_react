import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/server/jwt";
import bcrypt from "bcryptjs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  const user = verifyJwt(token);
  if (!user) return unauthorized();
  if ((user.role||"").toLowerCase()!=="admin") return forbidden();

  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id:true, login:true, role:true, createdAt:true,
      paymentMethod:true, houseNumber:true,
      city: { select: { name:true } },
      street: { select: { name:true } },
    }
  });

  return NextResponse.json({
    data: {
      users: users.map(u=>({
        id: u.id,
        login: u.login,
        role: u.role,
        city: u.city?.name || null,
        street: u.street?.name || null,
        houseNumber: u.houseNumber ?? null,
        paymentMethod: u.paymentMethod ?? null,
        createdAt: u.createdAt.toISOString(),
      }))
    }, message:"OK", error:null
  });
}

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i,"");
  const user = verifyJwt(token);
  if (!user) return unauthorized();
  if ((user.role||"").toLowerCase()!=="admin") return forbidden();

  const body = await req.json().catch(()=> ({}));
  const { login, password, role="user", paymentMethod = "card" } = body || {};
  if (!/^[A-Za-z][A-Za-z0-9]{2,}$/.test(login||"")) {
    return NextResponse.json({ error:"Invalid login" }, { status:400 });
  }
  if (!(typeof password==="string" && /^(?=.*[^\w\s]).{6,}$/.test(password))) {
    return NextResponse.json({ error:"Weak password" }, { status:400 });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const created = await prisma.user.create({
      data: { login, passwordHash: hash, role, paymentMethod }
    });
    return NextResponse.json({ data: { id: created.id }, message:"Created", error:null }, { status:201 });
  } catch (e:any) {
    if (String(e?.message||"").includes("Unique")) {
      return NextResponse.json({ error:"Login already exists" }, { status:409 });
    }
    return NextResponse.json({ error:"Failed to create" }, { status:500 });
  }
}
