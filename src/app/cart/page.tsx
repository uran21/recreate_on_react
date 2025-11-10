"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  productId: number;
  name: string;
  basePrice: number;
  price?: number;
  discountPrice?: number;
  sizeKey: "s" | "m" | "l";
  sizeLabel: string;
  adds: { name: string; addPrice: number }[];
  total: number;
  img: string;
  qty?: number;
};

type UserProfile = {
  city?: string;
  street?: string;
  houseNumber?: number;
  paymentMethod?: "cash" | "card" | string;
};

const money = (n: number) => `$${(n || 0).toFixed(2)}`;
const isAuthed = () => !!localStorage.getItem("authToken");
function keyOf(it: CartItem): string {
  const addsKey = (it.adds || [])
    .map((a) => a.name?.trim().toLowerCase())
    .sort()
    .join("|");
  return `${it.productId}__${it.sizeKey}__${addsKey}`;
}
function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("cart");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeCart(arr: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(arr));
  (window as any).CartBadge?.update?.();
  window.dispatchEvent(new Event("cart:updated"));
}
function groupCart(raw: CartItem[]): (CartItem & { qty: number })[] {
  const map = new Map<string, CartItem & { qty: number }>();
  raw.forEach((it) => {
    const k = keyOf(it);
    const ex = map.get(k);
    if (ex) ex.qty += 1;
    else map.set(k, { ...it, qty: 1 });
  });
  return Array.from(map.values());
}
function unitRegular(it: CartItem): number {
  const reg = (it.price ?? it.basePrice) || 0;
  const adds = (it.adds || []).reduce((s, a) => s + (a.addPrice || 0), 0);
  return reg + adds;
}
function unitPay(it: CartItem, authed: boolean): number {
  const base =
    authed && typeof it.discountPrice === "number"
      ? it.discountPrice
      : (it.price ?? it.basePrice) || 0;
  const adds = (it.adds || []).reduce((s, a) => s + (a.addPrice || 0), 0);
  return base + adds;
}
function readUser(): UserProfile {
  try {
    const raw = localStorage.getItem("user");
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? (obj as UserProfile) : {};
  } catch {
    return {};
  }
}
function humanPay(method?: string) {
  const v = (method || "").toLowerCase();
  if (v === "cash") return "Cash";
  if (v === "card") return "Card";
  return method || "-";
}

function base64UrlDecode(s: string): string {
  try {
    const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : "";
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return atob(b64);
  } catch {
    return "";
  }
}
function getTokenRole(): string | null {
  try {
    const t = localStorage.getItem("authToken");
    if (!t) return null;
    const [, payload] = t.split(".");
    if (!payload) return null;
    const data = JSON.parse(base64UrlDecode(payload) || "{}");
    let role: unknown = data?.role;
    if (!role && Array.isArray(data?.roles)) role = data.roles[0];
    if (!role && Array.isArray(data?.authorities)) role = data.authorities[0];
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export default function CartPage() {
  const [raw, setRaw] = useState<CartItem[]>([]);
  const [authed, setAuthed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>({});
  const [isAdmin, setIsAdmin] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const logged = !!token;
    setIsLoggedIn(logged);
    setAuthed(logged);
    setIsAdmin((getTokenRole() || "").toLowerCase() === "admin"); 

    async function loadProfile() {
      if (!token) return setUser({});
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
        const json = await res.json();
        setUser(json?.data || {});
      } catch (err) {
        console.warn("Failed to load profile:", err);
        setUser({});
      }
    }
    loadProfile();

    const handleLogin = () => {
      setIsLoggedIn(true);
      setAuthed(true);
      setIsAdmin((getTokenRole() || "").toLowerCase() === "admin");
      loadProfile();
    };
    const handleLogout = () => {
      setIsLoggedIn(false);
      setAuthed(false);
      setIsAdmin(false);
      setUser({});
    };

    window.addEventListener("auth:login", handleLogin);
    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:login", handleLogin);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    } else {
      const next = `${location.pathname}${location.search}${location.hash}`;
      router.push(`/signin?next=${encodeURIComponent(next)}`);
    }
  };

  const grouped = useMemo(() => groupCart(raw), [raw]);

  const totals = useMemo(() => {
    let regular = 0,
      pay = 0;
    grouped.forEach((it) => {
      regular += unitRegular(it) * (it.qty || 1);
      pay += unitPay(it, authed) * (it.qty || 1);
    });
    return { regular, pay };
  }, [grouped, authed]);

  useEffect(() => {
    setRaw(readCart());
    setAuthed(isAuthed());
    setUser(readUser());
    setIsAdmin((getTokenRole() || "").toLowerCase() === "admin"); 

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart" || e.key === "authToken" || e.key === "user") {
        setRaw(readCart());
        setAuthed(isAuthed());
        setUser(readUser());
        setIsAdmin((getTokenRole() || "").toLowerCase() === "admin"); 
      }
    };
    const onCart = () => setRaw(readCart());
    const onAuth = () => {
      setAuthed(isAuthed());
      setUser(readUser());
      setIsAdmin((getTokenRole() || "").toLowerCase() === "admin"); 
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCart);
    window.addEventListener("auth:login", onAuth);
    window.addEventListener("auth:logout", onAuth);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCart);
      window.removeEventListener("auth:login", onAuth);
      window.removeEventListener("auth:logout", onAuth);
    };
  }, []);

  const inc = (it: CartItem & { qty: number }) => {
    const clone = [...raw, { ...it, qty: undefined } as CartItem];
    writeCart(clone);
    setRaw(clone);
  };
  const dec = (it: CartItem & { qty: number }) => {
    const k = keyOf(it);
    const idx = raw.findIndex((x) => keyOf(x) === k);
    if (idx >= 0) {
      const clone = raw.slice();
      clone.splice(idx, 1);
      writeCart(clone);
      setRaw(clone);
    }
  };
  const removeAll = (it: CartItem & { qty: number }) => {
    const k = keyOf(it);
    const filtered = raw.filter((x) => keyOf(x) !== k);
    writeCart(filtered);
    setRaw(filtered);
  };
  const clear = () => {
    writeCart([]);
    setRaw([]);
  };

  const placeOrder = async () => {
    if (!isLoggedIn) return alert("Please sign in to confirm the order.");
    if (grouped.length === 0) return alert("Your cart is empty");

    const token = localStorage.getItem("authToken") || "";
    const payload = {
      items: grouped.map((it) => ({
        productId: it.productId,
        quantity: it.qty || 1,
        size: it.sizeKey,
        additives: (it.adds || []).map((a) => a.name),
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      clear();
      alert(`Thanks! Order #${json?.data?.id} placed.`);
    } catch (e) {
      alert(`Failed to place order: ${String(e)}`);
    }
  };

  const addressText =
    user?.city && user?.street && user?.houseNumber
      ? `${user.city}, ${user.street}, ${user.houseNumber}`
      : "-";

  const showTwoTotals = totals.regular > totals.pay;

  return (
    <main className="container cart-page">
      <h1 className="cart__title">Cart</h1>

      <ul id="cartList" className="cart-list">
        {grouped.length === 0 ? (
          <li className="cart-empty">Your cart is empty.</li>
        ) : (
          grouped.map((it) => {
            const unitReg = unitRegular(it);
            const unit = unitPay(it, authed);
            const showDisc = authed && unit < unitReg;
            return (
              <li key={keyOf(it)} className="cart-row">
                <div className="cart-row__left">
                  <button
                    className="icon-btn remove"
                    aria-label="Remove"
                    onClick={() => removeAll(it)}
                  >
                    🗑️
                  </button>
                  {it.img ? (
                    <img
                      className="cart-thumb"
                      src={it.img}
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/assets/logo.svg";
                      }}
                    />
                  ) : (
                    <div className="cart-thumb" />
                  )}
                  <div className="cart-info">
                    <div className="cart-title">{it.name}</div>
                    <div className="cart-meta">
                      {it.sizeLabel ? <span>{it.sizeLabel}</span> : null}
                      {it.adds?.length ? (
                        <span>{it.adds.map((a) => a.name).join(", ")}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="cart-row__right">
                  <div className="qty">
                    <button
                      className="qty-btn"
                      aria-label="Decrease"
                      onClick={() => dec(it)}
                    >
                      −
                    </button>
                    <span className="qty-val">{it.qty}</span>
                    <button
                      className="qty-btn"
                      aria-label="Increase"
                      onClick={() => inc(it)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-unit">
                    Unit:&nbsp;
                    {showDisc ? (
                      <>
                        <s>{money(unitReg)}</s> <strong>{money(unit)}</strong>
                      </>
                    ) : (
                      <strong>{money(unit)}</strong>
                    )}
                    {it.adds?.length ? " + adds" : ""}
                  </div>

                  <div className="cart-price">
                    {money(unit * (it.qty || 1))}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="cart-summary">
        <dl className="sum-list">
          <div className="row">
            <dt>Total:</dt>
            <dd>
              {showTwoTotals ? (
                <>
                  <s id="sumTotalReg">{money(totals.regular)}</s>{" "}
                  <strong id="sumTotalPay">{money(totals.pay)}</strong>
                </>
              ) : (
                <strong id="sumTotalPay">{money(totals.pay)}</strong>
              )}
            </dd>
          </div>

          <div className="row">
            <dt>Address:</dt>
            <dd>{addressText}</dd>
          </div>

          <div className="row">
            <dt>Pay by:</dt>
            <dd>{humanPay(user?.paymentMethod)}</dd>
          </div>
        </dl>
      </div>

      <div className="cart-actions">

        {isAdmin && (
          <a className="btn-crt btn-outline" href="/admin">
            Admin
          </a>
        )}


        {isLoggedIn && (
          <button className="btn-crt btn-outline" onClick={placeOrder}>
            Confirm
          </button>
        )}

        <button className="btn-crt btn-outline" onClick={clear}>
          Clear cart
        </button>

        {!isLoggedIn ? (
          <>
            <button
              className="btn-crt btn-outline"
              onClick={() => {
                const next = `${location.pathname}${location.search}${location.hash}`;
                location.href = `/signin?next=${encodeURIComponent(next)}`;
              }}
            >
              Sign in
            </button>
            <button
              className="btn-crt btn-outline"
              onClick={() => {
                const next = `${location.pathname}${location.search}${location.hash}`;
                location.href = `/register?next=${encodeURIComponent(next)}`;
              }}
            >
              Register
            </button>
          </>
        ) : (
          <button className="btn-crt btn-outline" onClick={handleAuthClick}>
            Sign out
          </button>
        )}
      </div>
    </main>
  );
}
