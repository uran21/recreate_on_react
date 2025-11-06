import type { AdditiveShape, Category, ProductDetails, RawSizes, SizeShape } from "./types";
import { FALLBACKS, IMGMAP, PLACEHOLDER_IMG } from "./imgmap";

export const toCents = (v: unknown) =>
  Math.round((Number(String(v ?? 0).replace(",", ".")) || 0) * 100);
export const fromCents = (c: number) => `$${(c / 100).toFixed(2)}`;

export type PriceCarrier = {
  price?: string | number; discountPrice?: string | number;
} & Partial<Record<"add-price"|"addPrice"|"add_price"|"add", string | number>>;

export function getPriceCents(obj: PriceCarrier | undefined, preferDiscount: boolean): number {
  if (!obj) return 0;
  const reg = obj.price ?? obj["add-price"] ?? obj.addPrice ?? obj.add_price ?? obj.add ?? 0;
  const disc = obj.discountPrice;
  return preferDiscount && disc != null ? toCents(disc) : toCents(reg);
}

export const isLoggedIn = () => !!(typeof window !== "undefined" && localStorage.getItem("authToken"));

export function normalizeSizesAll(sizes?: RawSizes): {
  std: Partial<Record<"s" | "m" | "l", SizeShape>>;
  all: Record<string, SizeShape>;
} {
  const all: Record<string, SizeShape> = {};
  if (sizes) Object.entries(sizes).forEach(([k, v]) => { if (v) all[k.toLowerCase()] = v; });
  return { std: { s: all["s"], m: all["m"], l: all["l"] }, all };
}

export function pickFirstSizeKey(all: Record<string, SizeShape>): string | null {
  const pref = ["s","m","l","xl","xxl","xs","large","medium","small"];
  for (const k of pref) if (all[k]) return k;
  const keys = Object.keys(all);
  return keys.length ? keys[0] : null;
}

export function imgForByCat(id: number, category: Category): string {
  const map = IMGMAP[category] || {};
  if (map[id]) return map[id];
  const pool = FALLBACKS[category];
  if (!pool?.length) return PLACEHOLDER_IMG;
  const idx = Math.abs(id) % pool.length;
  return pool[idx] || PLACEHOLDER_IMG;
}

export function attachPriceTooltipHtml(priceRegularC: number, pricePayC: number, authed: boolean) {
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
  return authed && pricePayC < priceRegularC
    ? `<s>${fmt(priceRegularC)}</s> <strong>${fmt(pricePayC)}</strong>`
    : fmt(priceRegularC);
}

export function computeTotals(d: ProductDetails, sizeKey: string, addsOn: Set<number>) {
  const authed = isLoggedIn();
  const { all: sizesAll } = normalizeSizesAll(d.sizes);

  const sizeRegC = sizesAll[sizeKey] ? getPriceCents(sizesAll[sizeKey], false) : getPriceCents(d, false);
  const sizePayC = sizesAll[sizeKey] ? getPriceCents(sizesAll[sizeKey], authed) : getPriceCents(d, authed);

  let addsRegC = 0, addsPayC = 0;
  (d.additives ?? []).forEach((ad, i) => {
    if (addsOn.has(i)) {
      addsRegC += getPriceCents(ad, false);
      addsPayC += getPriceCents(ad, authed);
    }
  });

  const totalRegC = sizeRegC + addsRegC;
  const totalPayC = sizePayC + addsPayC;
  return { totalRegC, totalPayC, sizeRegC, sizePayC };
}
