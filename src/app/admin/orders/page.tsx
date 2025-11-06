//admin/orders/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { isLoggedIn, getUser, signOut } from "@/lib/auth";

type AdminOrder = {
  id: number;
  status: string;
  totalCents: number;
  createdAt: string;
  customer?: {
    id: number;
    login: string;
    city?: string | null;
    street?: string | null;
    houseNumber?: number | null;
    paymentMethod?: string | null;
  } | null;
  items: {
    id: number;
    size: string;
    additivesJson: string;
    quantity: number;
    unitCents: number;
    product: { id: number; name: string | null };
  }[];
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const dateFmt = (s: string) => new Date(s).toLocaleString();

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [err, setErr] = useState<string>("");

  const me = getUser();
  const iAmAdmin = useMemo(
    () => !!me && (me.role || "").toLowerCase() === "admin",
    [me]
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch("/api/admin/orders", {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setOrders(json?.data?.orders || []);
    } catch (e: any) {
      setErr(String(e?.message || e) || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) return;
    load();
    const onAuth = () => load();
    window.addEventListener("auth:login", onAuth);
    window.addEventListener("auth:logout", onAuth);
    return () => {
      window.removeEventListener("auth:login", onAuth);
      window.removeEventListener("auth:logout", onAuth);
    };
  }, []);

  if (!isLoggedIn()) {
    return (
      <main className="container">
        <h1>Admin · Orders</h1>
        <p>You must sign in.</p>
        <p><a href="/signin?next=%2Fadmin%2Forders" className="btn">Sign in</a></p>
      </main>
    );
  }

  if (!iAmAdmin) {
    return (
      <main className="container">
        <h1>Admin · Orders</h1>
        <p>Forbidden: admin role required.</p>
        <button className="btn" onClick={() => signOut()}>Sign out</button>
      </main>
    );
  }

  return (
    <main className="container admin-orders">
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <h1>Admin · Orders</h1>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-outline" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button className="btn btn-outline" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>

      {err && <div className="toast toast--err">{err}</div>}

      {loading ? (
        <div className="fav-loader" style={{marginTop:16}}>
          <span className="fav-spinner" aria-hidden="true" /> Loading…
        </div>
      ) : orders.length === 0 ? (
        <p style={{marginTop:16}}>No orders yet.</p>
      ) : (
        <div className="table-wrap" style={{overflowX:"auto",marginTop:16}}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Created</th>
                <th>Status</th>
                <th>Total</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Pay by</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const addr = o.customer
                  ? [o.customer.city, o.customer.street, o.customer.houseNumber]
                      .filter(Boolean).join(", ")
                  : "-";
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{dateFmt(o.createdAt)}</td>
                    <td>
                      <span className={`badge badge--${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td><strong>{money(o.totalCents)}</strong></td>
                    <td>
                      {o.customer ? (
                        <>
                          <div>{o.customer.login}</div>
                          <div className="muted">#{o.customer.id}</div>
                        </>
                      ) : "-"}
                    </td>
                    <td>{addr || "-"}</td>
                    <td>{o.customer?.paymentMethod || "-"}</td>
                    <td>
                      <ul style={{margin:0,paddingLeft:18}}>
                        {o.items.map(it => {
                          const adds: string[] = (() => {
                            try { return JSON.parse(it.additivesJson || "[]"); }
                            catch { return []; }
                          })();
                          return (
                            <li key={it.id}>
                              {it.product?.name || "Product"} · {it.size} × {it.quantity} — {money(it.unitCents)}
                              {adds.length ? <> — <span className="muted">{adds.join(", ")}</span></> : null}
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .btn { padding:8px 14px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; }
        .btn-outline { background:#fff; }
        .toast { margin-top:12px; padding:10px 12px; border-radius:8px; }
        .toast--err { background:#ffe8e6; border:1px solid #ffb3ac; }
        .table { width:100%; border-collapse:collapse; }
        .table th, .table td { padding:10px 12px; border-bottom:1px solid #eee; vertical-align:top; }
        .muted { color:#666; font-size:12px; }
        .badge { padding:2px 8px; border-radius:999px; font-size:12px; border:1px solid #ddd; }
        .badge--new { background:#f2f7ff; border-color:#9ec5ff; }
        .badge--paid { background:#eefcf3; border-color:#98e6b5; }
        .badge--in_progress { background:#fff7e6; border-color:#ffd27a; }
        .badge--done { background:#ecfdf5; border-color:#a7f3d0; }
        .badge--canceled { background:#fff1f2; border-color:#fecdd3; }
      `}</style>
    </main>
  );
}
