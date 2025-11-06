"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function readCount(): number {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return 0;
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.length;           // твой текущий формат
    if (v && typeof v === "object") {
      // если вдруг будет формат {key: item}
      return Object.values(v as Record<string, any>)
        .reduce((n, it: any) => n + (Number(it?.qty) || 1), 0);
    }
    return 0;
  } catch {
    return 0;
  }
}

export default function CartLink({ onClick }: { onClick?: () => void } = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCount());
    update(); // сразу при маунте

    // 1) ловим кастомное событие из модалки
    window.addEventListener("cart:updated", update);

    // 2) совместимость с ванилью: global CartBadge.update()
    (window as any).CartBadge = (window as any).CartBadge || {};
    (window as any).CartBadge.update = update;

    // 3) storage — обновит в других вкладках
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart") update();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cart:updated", update);
      window.removeEventListener("storage", onStorage);
      // опционально: чистить глобал не обязательно
    };
  }, []);

  if (count <= 0) return null; // скрываем, пока корзина пуста

  return (
    <Link className="nav-link nav-link--cart" href="/cart" onClick={onClick}>
      <span>Cart</span>
      <span className="cart-badge" aria-live="polite">{count}</span>
      <img className="nav-ico" src="/assets/shopping-bag.png" alt="" aria-hidden="true" />
    </Link>
  );
}
