import { NextResponse } from "next/server";
import { verifyJwt } from "@/server/jwt";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(
    /^Bearer\s+/i,
    ""
  );
  const me = verifyJwt(token);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((me.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image/* allowed" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = (file.type.split("/")[1] || "bin").toLowerCase();
    const hash = crypto
      .createHash("sha1")
      .update(buf)
      .digest("hex")
      .slice(0, 16);
    const base =
      (file.name || "image").replace(/[^\w.-]+/g, "_").slice(0, 40) || "image";
    const fileName = `${Date.now()}_${hash}_${base}.${ext}`;

    const pubDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(pubDir, "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buf);

    return NextResponse.json(
      { data: { url: `/uploads/${fileName}` } },
      { status: 201 }
    );
  } catch (e) {
    console.error("upload-image error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
