"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function readCount(): number {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return 0;
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.length;           
    if (v && typeof v === "object") {
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
    update(); 

    window.addEventListener("cart:updated", update);

    (window as any).CartBadge = (window as any).CartBadge || {};
    (window as any).CartBadge.update = update;

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart") update();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cart:updated", update);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (count <= 0) return null; 
  return (
    <Link className="nav-link nav-link--cart" href="/cart" onClick={onClick}>
      <span>Cart</span>
      <span className="cart-badge" aria-live="polite">{count}</span>
      <img className="nav-ico" src="/assets/shopping-bag.png" alt="" aria-hidden="true" />
    </Link>
  );
}
