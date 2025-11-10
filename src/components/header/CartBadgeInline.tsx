"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function readCount(): number {
  try {
    const raw = localStorage.getItem("cart");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

export default function CartBadgeInline() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCount());
    update();
    window.addEventListener("cart:updated", update);
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === "cart") update();
    });
    return () => {
      window.removeEventListener("cart:updated", update);
    };
  }, []);

  return (
    <Link className="nav-link nav-link--cart" href="/cart">
      <span>Cart</span>
      {count > 0 && (
        <span className="cart-badge" aria-live="polite">{count}</span>
      )}
      <img className="nav-ico" src="/assets/shopping-bag.png" alt="" aria-hidden="true" />
    </Link>
  );
}
