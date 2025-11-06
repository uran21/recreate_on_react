import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";

export type JwtPayload = { id: number; login: string; role: string };

export function signJwt(payload: JwtPayload, days = 7) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${days}d` });
}

export function verifyJwt(token: string): JwtPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as JwtPayload; }
  catch { return null; }
}
