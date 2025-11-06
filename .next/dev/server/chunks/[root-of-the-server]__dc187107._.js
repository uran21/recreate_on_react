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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jsonwebtoken@9.0.2/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_fallback";
function signJwt(payload, days = 7) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: `${days}d`
    });
}
function verifyJwt(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jsonwebtoken$40$9$2e$0$2e$2$2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
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

// src/app/api/admin/orders/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth-server.ts [app-route] (ecmascript)");
;
;
;
const runtime = "nodejs";
async function GET(req) {
    try {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
        if ((user.role || "").toLowerCase() !== "admin") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Forbidden"
            }, {
                status: 403
            });
        }
        const orders = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].order.findMany({
            orderBy: {
                createdAt: "desc"
            },
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
        // Нормализуем адрес
        const norm = orders.map((o)=>({
                ...o,
                customer: o.customer && {
                    id: o.customer.id,
                    login: o.customer.login,
                    city: o.customer.city?.name,
                    street: o.customer.street?.name,
                    houseNumber: o.customer.houseNumber,
                    paymentMethod: o.customer.paymentMethod
                }
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: {
                orders: norm
            },
            message: "OK",
            error: null
        });
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthError"]) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: e.message
            }, {
                status: e.status
            });
        }
        console.error("GET /api/admin/orders error:", e);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load orders"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dc187107._.js.map