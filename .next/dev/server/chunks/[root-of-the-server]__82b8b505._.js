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
"[project]/src/app/api/products/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/app/api/products/[id]/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
async function GET(req, { params } // <-- Next 15 сигнатура
) {
    // 1) Берём id из params (Next 15: Promise), fallback — из URL
    let idStr;
    try {
        const p = await params;
        idStr = p?.id;
    } catch  {
    // ignore
    }
    if (!idStr) {
        const m = req.nextUrl.pathname.match(/\/api\/products\/(\d+)\/?$/);
        if (m) idStr = m[1];
    }
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid ID"
        }, {
            status: 400
        });
    }
    // 2) Продукт (raw без делегатов)
    const prodRows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
    SELECT id, name, description, priceCents, discountPriceCents, category, image, sizesJson, additivesJson
    FROM Product
    WHERE id = ${id}
    LIMIT 1
  `;
    if (!prodRows.length) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Not found"
        }, {
            status: 404
        });
    }
    const p = prodRows[0];
    // 3) Sizes: таблица → JSON fallback
    let sizes = null;
    try {
        const sizeRows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
      SELECT key, label, priceCents, discountPriceCents
      FROM ProductSize
      WHERE productId = ${id}
      ORDER BY key ASC
    `;
        if (sizeRows.length) {
            sizes = Object.fromEntries(sizeRows.map((s)=>[
                    s.key,
                    {
                        size: s.label ?? null,
                        price: (s.priceCents / 100).toFixed(2),
                        discountPrice: s.discountPriceCents != null ? (s.discountPriceCents / 100).toFixed(2) : null
                    }
                ]));
        } else if (p.sizesJson) {
            try {
                sizes = JSON.parse(p.sizesJson);
            } catch  {
                sizes = null;
            }
        }
    } catch  {
        if (p.sizesJson) {
            try {
                sizes = JSON.parse(p.sizesJson);
            } catch  {
                sizes = null;
            }
        }
    }
    // 4) Additives: JOIN → JSON fallback
    let additives = [];
    try {
        const addRows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$queryRaw`
      SELECT a.name, a.priceCents, a.discountPriceCents
      FROM ProductAdditive pa
      JOIN Additive a ON a.id = pa.additiveId
      WHERE pa.productId = ${id}
      ORDER BY a.id ASC
    `;
        if (addRows.length) {
            additives = addRows.map((a)=>({
                    name: a.name,
                    price: (a.priceCents / 100).toFixed(2),
                    discountPrice: a.discountPriceCents != null ? (a.discountPriceCents / 100).toFixed(2) : null
                }));
        } else if (p.additivesJson) {
            try {
                additives = JSON.parse(p.additivesJson);
            } catch  {
                additives = [];
            }
        }
    } catch  {
        if (p.additivesJson) {
            try {
                additives = JSON.parse(p.additivesJson);
            } catch  {
                additives = [];
            }
        }
    }
    // 5) Ответ в «старом» формате
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        data: {
            id: p.id,
            name: p.name,
            description: p.description ?? "",
            price: (p.priceCents / 100).toFixed(2),
            discountPrice: p.discountPriceCents != null ? (p.discountPriceCents / 100).toFixed(2) : null,
            category: p.category,
            image: p.image,
            images: [],
            sizes,
            additives
        },
        message: "OK",
        error: null
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__82b8b505._.js.map