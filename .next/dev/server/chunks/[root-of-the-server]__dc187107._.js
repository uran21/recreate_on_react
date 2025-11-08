module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prisma = global.prismaGlobal || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error",
        "warn"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) global.prismaGlobal = prisma;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/server/jwt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signJwt",
    ()=>signJwt,
    "verifyJwt",
    ()=>verifyJwt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";
function signJwt(payload, days = 7) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: `${days}d`
    });
}
function verifyJwt(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
}
}),
"[project]/src/lib/auth-server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/auth-server.ts
__turbopack_context__.s([
    "AuthError",
    ()=>AuthError,
    "readBearer",
    ()=>readBearer,
    "requireUser",
    ()=>requireUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/jwt.ts [app-route] (ecmascript)");
;
class AuthError extends Error {
    status = 401;
    constructor(msg = "Unauthorized"){
        super(msg);
    }
}
function readBearer(req) {
    const h = req.headers.get("authorization") || "";
    if (h.startsWith("Bearer ")) return h.slice(7).trim();
    // допускаем токен без префикса (на всякий случай)
    return h ? h.trim() : null;
}
function requireUser(req) {
    const token = readBearer(req);
    const payload = token ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$jwt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyJwt"])(token) : null;
    if (!payload) throw new AuthError();
    return {
        id: payload.id,
        login: payload.login,
        role: payload.role
    };
}
}),
"[project]/src/app/api/admin/orders/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-server.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
function startOfDayUTC(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function dayKeyUTC(d) {
    // YYYY-MM-DD по UTC (удобно и стабильно для сервера)
    return d.toISOString().slice(0, 10);
}
async function GET(req) {
    try {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
        if ((user.role || "").toLowerCase() !== "admin") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forbidden"
            }, {
                status: 403
            });
        }
        const url = new URL(req.url);
        const days = Math.max(1, Math.min(10, Number(url.searchParams.get("days")) || 3)); // 1..10
        const cursorRaw = url.searchParams.get("cursor"); // ISO-строка или null
        const cursor = cursorRaw ? new Date(cursorRaw) : new Date();
        if (isNaN(cursor.getTime())) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid cursor"
            }, {
                status: 400
            });
        }
        // Берём достаточно заказов "в запас" (например, 800), чтобы точно набрать 3 дня
        // При необходимости увеличь/уменьши take под свои объёмы.
        const chunk = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].order.findMany({
            where: {
                createdAt: {
                    lt: cursor
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 800,
            select: {
                id: true,
                status: true,
                totalCents: true,
                createdAt: true,
                customer: {
                    select: {
                        id: true,
                        login: true,
                        city: {
                            select: {
                                name: true
                            }
                        },
                        street: {
                            select: {
                                name: true
                            }
                        },
                        houseNumber: true,
                        paymentMethod: true
                    }
                },
                items: {
                    select: {
                        id: true,
                        size: true,
                        additivesJson: true,
                        quantity: true,
                        unitCents: true,
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        const buckets = {};
        const dayOrder = [];
        for (const o of chunk){
            const k = dayKeyUTC(o.createdAt);
            if (!buckets[k]) {
                if (dayOrder.length >= days) break; // уже набрали нужное кол-во дат
                buckets[k] = {
                    dayIso: k,
                    totalCents: 0,
                    orders: []
                };
                dayOrder.push(k);
            }
            buckets[k].orders.push({
                ...o,
                customer: o.customer && {
                    id: o.customer.id,
                    login: o.customer.login,
                    city: o.customer.city?.name ?? null,
                    street: o.customer.street?.name ?? null,
                    houseNumber: o.customer.houseNumber ?? null,
                    paymentMethod: o.customer.paymentMethod ?? null
                }
            });
            buckets[k].totalCents += o.totalCents;
        }
        const daysOut = dayOrder.map((k)=>buckets[k]);
        // Сформируем nextBefore: это 00:00 UTC дня, который идёт ПЕРЕД самым старым из выданных
        let nextBefore = null;
        let hasMore = false;
        if (dayOrder.length > 0) {
            const oldestDayIso = dayOrder[dayOrder.length - 1]; // последний в списке — самый старый день
            const [y, m, d] = oldestDayIso.split("-").map(Number);
            const oldestDayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
            // следующий курсор — начало суток ещё на день раньше
            const prevDayStart = new Date(oldestDayStart.getTime() - 24 * 60 * 60 * 1000);
            nextBefore = prevDayStart.toISOString();
            // Проверяем, есть ли ещё заказы раньше prevDayStart
            const more = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].order.findFirst({
                where: {
                    createdAt: {
                        lt: prevDayStart
                    }
                },
                select: {
                    id: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            });
            hasMore = !!more;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: {
                days: daysOut,
                nextBefore,
                hasMore
            },
            message: "OK",
            error: null
        });
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthError"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: e.message
            }, {
                status: e.status
            });
        }
        console.error("GET /api/admin/orders error:", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load orders"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dc187107._.js.map