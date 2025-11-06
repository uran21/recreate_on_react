"use client";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/MenuPage.module.css";
import type { Category, ProductDetails } from "./types";
import {
  attachPriceTooltipHtml,
  computeTotals,
  fromCents,
  getPriceCents,
  imgForByCat,
  isLoggedIn,
  normalizeSizesAll,
  pickFirstSizeKey,
  toCents,
} from "./vanilla-helpers";
import { PLACEHOLDER_IMG } from "./imgmap";

export default function ProductModal({
  productId,
  cat,
  cardImg,
  cardListPriceCents, // ← цена, показанная на карточке (в центах)
  onClose,
}: {
  productId: number;
  cat: Category;
  cardImg?: string;
  cardListPriceCents?: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sizeKey, setSizeKey] = useState<string>("s");
  const [addsOn, setAddsOn] = useState<Set<number>>(new Set());

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
        const raw = await res.json();
        const d = raw?.data ?? raw;

        const details: ProductDetails = {
          id: d.id,
          name: d.name,
          description: d.description ?? "",
          price: String(d.price),
          discountPrice: d.discountPrice ? String(d.discountPrice) : undefined,
          category: d.category as Category,
          images: d.images ?? [],
          sizes: d.sizes ?? undefined,
          additives: d.additives ?? [],
        };

        if (abort) return;
        setData(details);

        // ---- ЕДИНЫЙ ДЕФОЛТ РАЗМЕР ----
        // 1) если пришла cardListPriceCents — пробуем найти размер, у которого рег. цена совпадает
        // 2) иначе берём 's', если есть
        // 3) иначе — самый дешёвый по регулярной цене
        const { all } = normalizeSizesAll(details.sizes);

        let initKey: string | undefined;
        if (cardListPriceCents && Object.keys(all).length) {
          const match = Object.entries(all).find(
            ([, s]) => getPriceCents(s, false) === cardListPriceCents
          );
          if (match) {
            initKey = match[0];
          }
        }
        if (!initKey) {
          if (all["s"]) {
            initKey = "s";
          } else if (Object.keys(all).length) {
            initKey = Object.entries(all).sort(
              (a, b) => getPriceCents(a[1], false) - getPriceCents(b[1], false)
            )[0]?.[0];
          }
        }
        setSizeKey(initKey ?? "s");
        setAddsOn(new Set());
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [productId, cardListPriceCents]); // важно слушать cardListPriceCents

  const imgSrc = useMemo(() => {
    if (!data) return cardImg || imgForByCat(productId, cat);
    const fromApi = Array.isArray(data.images) && data.images[0] ? data.images[0] : "";
    return fromApi || cardImg || imgForByCat(data.id, data.category);
  }, [data, cardImg, productId, cat]);

  if (!data) {
    return (
      <div className={styles.pm__grid}>
        <figure className={styles.pm__media}>
          <img id="pmImg" alt="Loading…" src={imgSrc} />
        </figure>
        <div className={styles.pm__content}>
          <div className={styles.pm__loading}>
            <div className="fav-loader">
              <span className="fav-spinner" aria-hidden="true" />
              <span className="fav-loader__text">Loading details…</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { all: sizesAll } = normalizeSizesAll(data.sizes);
  const authed = isLoggedIn();
  const { totalRegC, totalPayC } = computeTotals(data, sizeKey, addsOn);

  const totalHtml: ReactNode =
    authed && totalPayC < totalRegC ? (
      <>
        <s className={styles.priceOld}>{fromCents(totalRegC)}</s>{" "}
        <strong className="price--new">{fromCents(totalPayC)}</strong>
      </>
    ) : (
      fromCents(totalRegC)
    );

  const addToCart = () => {
    if (!data) return;
    const sizeObj = sizesAll[sizeKey];
    const sizeRegC = sizeObj ? getPriceCents(sizeObj, false) : getPriceCents(data, false);
    const sizeDisc =
      sizeObj?.discountPrice != null
        ? toCents(sizeObj.discountPrice)
        : data.discountPrice != null
        ? toCents(data.discountPrice)
        : undefined;

    const sizeKeyStd = (["s", "m", "l"] as const).includes(sizeKey as any)
      ? (sizeKey as "s" | "m" | "l")
      : "s";

    const cartItem = {
      productId: data.id,
      name: data.name,
      // basePrice = что реально оплачиваем за единицу (без добавок)
      basePrice: (sizeDisc != null && authed ? sizeDisc : sizeRegC) / 100,
      // price = «регулярная» цена ед., чтобы корректно рисовать перечёркивание
      price: sizeRegC / 100,
      discountPrice: sizeDisc != null ? sizeDisc / 100 : undefined,
      sizeKey: sizeKeyStd,
      sizeLabel: (sizeObj?.size ?? sizeObj?.label ?? "") || "",
      adds: (data.additives ?? [])
        .map((ad, i) =>
          addsOn.has(i)
            ? {
                name: ad.name ?? ad.title ?? `Additive ${i + 1}`,
                addPrice: getPriceCents(ad, authed) / 100,
              }
            : null
        )
        .filter(Boolean),
      total: totalPayC / 100,
      img: imgSrc,
    };

    const raw = localStorage.getItem("cart");
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(arr));
    (window as any).CartBadge?.update?.();
    window.dispatchEvent(new Event("cart:updated"));
    onClose();
  };

  return (
    <div className={styles.pm__grid}>
      <figure className={styles.pm__media}>
        <img
          id="pmImg"
          alt={data?.name ?? "Loading preview"}
          src={imgSrc}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />
      </figure>

      <div className={styles.pm__content}>
        {loading && (
          <div className={styles.pm__loading}>
            <div className="fav-loader">
              <span className="fav-spinner" aria-hidden="true"></span>
              <span className="fav-loader__text">Loading details…</span>
            </div>
          </div>
        )}

        <h3 id="pmTitle" className={styles.pm__title}>
          {data?.name ?? ""}
        </h3>
        <p id="pmDesc" className={styles.pm__desc}>
          {data?.description ?? ""}
        </p>

        <div className={styles.pm__section}>
          <div className={styles.pm__label}>Size</div>

          <nav id="pmSizes" className={styles.pm__chips} aria-label="Sizes">
            {Object.entries(sizesAll).map(([k, sObj]) => {
              if (!sObj) return null;

              const sizeLabel = String(sObj.size ?? sObj.label ?? "");
              const regC = getPriceCents(sObj, false) || getPriceCents(data, false);
              const payC = getPriceCents(sObj, authed) || getPriceCents(data, authed);
              const on = k === sizeKey;

              return (
                <button
                  key={k}
                  type="button"
                  className={styles["pm-chip"]}
                  data-on={on}
                  aria-pressed={on}
                  onClick={() => setSizeKey(k)}
                >
                  <span className={styles["pm-chip__lead"]}>{k.toUpperCase()}</span>
                  <span dangerouslySetInnerHTML={{ __html: sizeLabel }} />
                  <span
                    className="pm-tt"
                    dangerouslySetInnerHTML={{
                      __html: attachPriceTooltipHtml(regC, payC, authed),
                    }}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.pm__section}>
          <div className={styles.pm__label}>Additives</div>

          <nav id="pmAdds" className={styles.pm__chips} aria-label="Additives">
            {(data?.additives ?? []).map((ad, i) => {
              const name = ad.name ?? ad.title ?? `Additive ${i + 1}`;
              const regC = getPriceCents(ad, false);
              const payC = getPriceCents(ad, authed);
              const on = addsOn.has(i);

              return (
                <button
                  key={i}
                  type="button"
                  className={styles["pm-chip"]}
                  data-on={on}
                  aria-pressed={on}
                  onClick={() => {
                    const next = new Set(addsOn);
                    on ? next.delete(i) : next.add(i);
                    setAddsOn(next);
                  }}
                >
                  <span className={styles["pm-chip__lead"]}>{i + 1}</span>
                  {name}
                  <span
                    className="pm-tt"
                    dangerouslySetInnerHTML={{
                      __html: attachPriceTooltipHtml(regC, payC, authed),
                    }}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.pm__total}>
          <span className={styles["pm__total-label"]}>Total:</span>
          <strong id="pmTotal" className={styles["pm__total-price"]}>
            {totalHtml}
          </strong>
        </div>

        <p className={styles.pm__note}>
          The cost is not final. Download our mobile app to see the final price and place your order…
        </p>

        <button className={styles.pm__close} type="button" onClick={addToCart} disabled={!data || loading}>
          Add to cart
        </button>
      </div>
    </div>
  );
}
