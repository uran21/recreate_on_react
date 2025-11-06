// src/lib/auth-server.ts
import { verifyJwt } from "@/server/jwt";

export type AuthUser = { id: number; login: string; role: string };

export class AuthError extends Error {
  status = 401;
  constructor(msg = "Unauthorized") { super(msg); }
}

export function readBearer(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  if (h.startsWith("Bearer ")) return h.slice(7).trim();
  // допускаем токен без префикса (на всякий случай)
  return h ? h.trim() : null;
}

export function requireUser(req: Request): AuthUser {
  const token = readBearer(req);
  const payload = token ? verifyJwt(token) : null;
  if (!payload) throw new AuthError();
  return { id: payload.id, login: payload.login, role: payload.role };
}
