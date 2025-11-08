// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// имя cookie ДОЛЖНО совпадать с тем, что ты ставишь в /api/session/sync
const COOKIE_NAME = "authToken";

// один и тот же секрет, что и при подписи токена
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_secret_fallback"
);

export async function middleware(req: NextRequest) {
  try {
    const { pathname, search } = req.nextUrl;

    // Защищаем только /admin — всё остальное пропускаем
    if (!pathname.startsWith("/admin")) return NextResponse.next();

    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const signin = new URL("/signin", req.url);
      signin.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signin);
    }

    // Edge-совместимая проверка JWT
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    const role = ((payload as any)?.role ||
      (Array.isArray((payload as any)?.roles) && (payload as any).roles[0]) ||
      (Array.isArray((payload as any)?.authorities) &&
        (payload as any).authorities[0]) ||
      "") as string;

    if ((role || "").toLowerCase() !== "admin") {
      const signin = new URL("/signin", req.url);
      signin.searchParams.set("next", pathname + search);
      return NextResponse.redirect(signin);
    }

    return NextResponse.next();
  } catch {
    // Любая ошибка в middleware — просто уводим на signin для /admin
    // и НИКОГДА не ломаем остальные страницы
    const signin = new URL("/signin", req.url);
    signin.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
    return NextResponse.redirect(signin);
  }
}

export const config = {
  matcher: ["/admin/:path*"], // middleware активен только под /admin
};
