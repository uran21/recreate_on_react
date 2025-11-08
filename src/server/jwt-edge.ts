// server/jwt-edge.ts
import { jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";

export type EdgeJwtPayload = JWTPayload & {
  id?: number;
  login?: string;
  role?: string;
  roles?: string[];
  authorities?: string[];
};

export async function verifyJwtEdge(token: string): Promise<EdgeJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    return payload as EdgeJwtPayload;
  } catch {
    return null;
  }
}
