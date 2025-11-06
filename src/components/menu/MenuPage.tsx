// app/components/menu/MenuPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/MenuPage.module.css";
import type { Category, ProductListItem } from "./types";
import { FALLBACKS, IMGMAP, PLACEHOLDER_IMG } from "./imgmap";
import { isLoggedIn, toCents, fromCents } from "./vanilla-helpers";
import ProductModal from "./ProductModal";

const MOBILE_MAX = 768;
const MOBILE_VISIBLE = 4;

export default function MenuPage() {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [cat, setCat] = useState<Category>("coffee");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // читаем #hash как категорию
  useEffect(() => {
    const hash = (window.location.hash || "").slice(1) as Category;
    if (["coffee", "tea", "dessert"].includes(hash)) setCat(hash);
  }, []);

  // загрузка списка
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?sort=name_asc`, { cache: "no-store" });
        if (!res.ok) {
          console.error("GET /api/products failed:", res.status, await res.text());
          if (!abort) setItems([]);
          return;
        }
        const json = await res.json();

        // Поддерживаем {items}, {data} и массив
        const rawList: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.items)
          ? json.items
          : Array.isArray(json.data)
          ? json.data
          : [];

        // НИЧЕГО не форматируем в валюту здесь — только пробрасываем «как есть».
        const list: ProductListItem[] = rawList.map((p) => ({
          id: Number(p.id),
          name: String(p.name ?? ""),
          description: String(p.description ?? ""),
          // оставляем как пришло; в карточке сами разрулим cents/строку
          price: p.price ?? null,
          discountPrice: p.discountPrice ?? null,
          // категории нормализуем
          category: String(p.category ?? "coffee").toLowerCase() as Category,
          // если API уже отдаёт *Cents — оставим их (расширяем тип через any)
          ...(typeof p.priceCents === "number" ? { priceCents: p.priceCents } : {}),
          ...(typeof p.discountPriceCents === "number"
            ? { discountPriceCents: p.discountPriceCents }
            : {}),
        })) as any;

        if (!abort) setItems(list);
      } catch (e) {
        console.error("GET /api/products error:", e);
        if (!abort) setItems([]);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  // Фильтрация по категории + выдача картинок
  const filtered = useMemo(() => {
    const list = items.filter((p) => p.category === cat).sort((a, b) => a.id - b.id);
    const pool = FALLBACKS[cat] ?? [];
    const used = new Set<string>();
    let cursor = 0;
    const nextFromPool = () => {
      if (!pool.length) return PLACEHOLDER_IMG;
      for (let k = 0; k < pool.length; k++) {
        const idx = (cursor + k) % pool.length;
        const src = pool[idx];
        if (!used.has(src)) {
          used.add(src);
          cursor = idx + 1;
          return src;
        }
      }
      return pool[0] || PLACEHOLDER_IMG;
    };
    return list.map((p) => {
      const mapped = IMGMAP[cat]?.[p.id];
      return { ...p, _img: mapped ?? nextFromPool() } as ProductListItem & { _img: string };
    });
  }, [items, cat]);

  // Мобильное «показать ещё»
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const calc = () => setIsMobile(window.innerWidth <= MOBILE_MAX);
    calc();
    const onResize = () => {
      setShowAllMobile(false);
      calc();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visibleCards =
    isMobile && !showAllMobile ? filtered.slice(0, MOBILE_VISIBLE) : filtered;

  const openModal = (id: number) => {
    setSelectedId(id);
    setOpen(true);
    document.body.classList.add("no-scroll");
  };
  const closeModal = () => {
    setOpen(false);
    document.body.classList.remove("no-scroll");
  };

  // ВХОД ЗДЕСЬ НЕ НУЖЕН — проверяем только при отрисовке карточек
  const authed = isLoggedIn();

  return (
    <section id="menu" className={`${styles.menu} section`}>
      <div className="container">
        <header className={styles.menu__head}>
          <h1 className={`${styles.menu__title} heading-1`}>
            Behind each of our cups
            <br />
            hides an <em className={styles.menu__accent}>amazing surprise</em>
          </h1>

          <nav className={styles.menu__filters} aria-label="Filters">
            {(["coffee", "tea", "dessert"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={`${styles.chip} ${cat === k ? "is-active" : ""}`}
                data-filter={k}
                aria-pressed={cat === k}
                onClick={() => setCat(k)}
              >
                <span className={styles.chip__iconbox} aria-hidden="true">
                  <img
                    className="ico ico--hover"
                    src={`/assets/icons/${k === "dessert" ? "desert" : k}-hov.png`}
                    alt=""
                    aria-hidden="true"
                  />
                </span>
                <span>{k[0].toUpperCase() + k.slice(1)}</span>
              </button>
            ))}
          </nav>
        </header>

        <ol
          className={styles.menu__grid}
          role="region"
          aria-label="Products"
          aria-busy={loading}
        >
          {loading && (
            <>
              <li className={styles["grid-loader"]}>
                <span className="fav-spinner" aria-hidden="true"></span>
                <span>Loading menu…</span>
              </li>
              <li className={styles["grid-loader"]}></li>
              <li className={styles["grid-loader"]}></li>
              <li className={styles["grid-loader"]}></li>
            </>
          )}

          {!loading &&
            visibleCards.map((p) => {
              // 🔧 Надёжная нормализация цены для карточки:
              // 1) Если есть priceCents → используем его
              // 2) Иначе, если есть discountPriceCents → тоже умеем
              // 3) Иначе пытаемся распарсить строковый price / discountPrice
              const priceC =
                typeof (p as any).priceCents === "number"
                  ? (p as any).priceCents
                  : toCents(String((p as any).price ?? p.price ?? "0"));

              const discC =
                typeof (p as any).discountPriceCents === "number"
                  ? (p as any).discountPriceCents
                  : (p as any).discountPrice != null
                  ? toCents(String((p as any).discountPrice))
                  : 0;

              const showDisc = authed && discC > 0 && discC < priceC;

              return (
                <li
                  key={p.id}
                  className={styles.card}
                  data-type={p.category}
                  data-id={p.id}
                  onClick={() => openModal(p.id)}
                >
                  <figure className={styles.card__media}>
                    <img
                      src={(p as any)._img}
                      alt={p.name}
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).src = "/assets/logo.svg")
                      }
                    />
                  </figure>
                  <div className={styles.card__body}>
                    <h3 className={styles.card__title}>{p.name}</h3>
                    <p className={styles.card__sub}>{p.description}</p>
                    <div className={styles.card__price}>
                      {showDisc ? (
                        <>
                          <s className="muted">{fromCents(priceC)}</s>{" "}
                          <strong>{fromCents(discC)}</strong>
                        </>
                      ) : (
                        fromCents(priceC)
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ol>

        <div className={styles.menu__more}>
          <button
            id="load-more"
            className={styles.loadmore}
            hidden={!(isMobile && filtered.length > MOBILE_VISIBLE && !showAllMobile)}
            aria-label="Load more"
            onClick={() => setShowAllMobile(true)}
          >
            <svg viewBox="0 0 24 24" width="70" height="70" aria-hidden="true" className="svg">
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M20 12a8 8 0 1 1-2.3-5.7" />
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 3v6h-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Модалка */}
      <div
        id="productModal"
        className={`${styles.modal} ${open ? styles["is-open"] : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.modal__scrim} data-close onClick={closeModal}></div>
        <div className={styles.modal__dialog} role="dialog" aria-modal="true" aria-labelledby="pmTitle">
          <button
            className={styles["modal__close-x"]}
            type="button"
            data-close
            aria-label="Close modal"
            onClick={closeModal}
          >
            <svg className={styles["modal__close-ico"]} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {open && selectedId && (
            <ProductModal
              productId={selectedId}
              cat={cat}
              cardImg={
                filtered.find((x) => x.id === selectedId)
                  ? (filtered.find((x) => x.id === selectedId) as any)._img
                  : undefined
              }
              onClose={closeModal}
            />
          )}
        </div>
      </div>
    </section>
  );
}
