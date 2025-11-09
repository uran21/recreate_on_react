"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/adminButtons.module.css";
import { signOut, isLoggedIn, getUser } from "@/lib/auth";

type UserRow = { id: number; login: string; role: string; createdAt: string };

type TopProduct = {
  category: string;
  name: string;
  qty: number;
  revenueCents: number;
};

type AnalyticsResp = {
  data?: { topProducts?: TopProduct[] };
  error?: string | null;
  message?: string;
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
function errToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "Unknown error";
  }
}

export default function AdminApp({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const iAmAdmin = useMemo(
    () => authed && (role || "").toLowerCase() === "admin",
    [authed, role]
  );

  // read auth only on the client
  useEffect(() => {
    setMounted(true);
    try {
      setAuthed(isLoggedIn());
      setRole(getUser()?.role ?? null);
    } catch {
      setAuthed(false);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !iAmAdmin) {
      setLoading(false);
      return;
    }

    async function loadAnalytics() {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await fetch("/api/admin/analytics", {
          headers: {
            accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          cache: "no-store",
        });
        const json: AnalyticsResp = await res.json();
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setTopProducts(json?.data?.topProducts ?? []);
      } catch (e) {
        setErr(errToString(e));
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [mounted, iAmAdmin]);

  // Group top products by category and take top-N for each
  const grouped = useMemo(() => {
    const map = new Map<string, TopProduct[]>();
    for (const p of topProducts) {
      const key = (p.category || "Other").toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // sort within category by revenue and quantity
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => b.revenueCents - a.revenueCents || b.qty - a.qty);
      map.set(k, arr.slice(0, 5)); // show top 5
    }
    return map;
  }, [topProducts]);

  if (!mounted) return <main className={`${styles.container} container`} />;

  if (!authed) {
    return (
      <main className={`${styles.container} container`}>
        <header className={styles.header}>
          <h1>Admin</h1>
          <a className={styles.btn} href="/signin?next=%2Fadmin">
            Sign in
          </a>
        </header>
      </main>
    );
  }

  if (!iAmAdmin) {
    return (
      <main className="container">
        <header className={styles.header}>
          <h1>Admin</h1>
          <button className={styles.btn} onClick={() => signOut()}>
            Sign out
          </button>
        </header>
        <p>Forbidden: admin role required.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Admin Dashboard</h1>
        </div>
        <div className={styles.btnRow}>
          <a href="/admin/products" className={styles.btn}>
            Products
          </a>
          <a href="/admin/users" className={styles.btn}>
            Users
          </a>
          <a href="/admin/orders" className={styles.btn}>
            Orders
          </a>

          <button
            className={styles.btn}
            onClick={() => location.reload()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>

          <a href="/menu" className={styles.btn}>
            Menu
          </a>
        </div>
      </header>
      {err && <div className={styles.toastErr}>{err}</div>}

      {/* --- Block: Top sales by category (last 30 days) --- */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          Top sales by category · last 30 days
        </h2>

        {loading && topProducts.length === 0 ? (
          <div style={{ marginTop: 8 }}>Loading…</div>
        ) : topProducts.length === 0 ? (
          <p style={{ marginTop: 8 }}>No sales data available.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 12,
            }}
          >
            {[...grouped.entries()].map(([cat, items]) => (
              <div key={cat} className={styles.card}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {categoryTitle(cat)}
                </div>

                <table className={`${styles.tableNice} ${styles.tableCompact}`}>
                  <thead>
                    <tr>
                      <th style={{ width: "60%" }}>Product</th>
                      <th className={styles.thRight} style={{ width: "20%" }}>
                        Qty
                      </th>
                      <th className={styles.thRight} style={{ width: "20%" }}>
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p, i) => (
                      <tr key={`${p.name}-${i}`}>
                        <td className={styles.nameCell}>{p.name}</td>
                        <td className={styles.tdRight}>{p.qty}</td>
                        <td className={styles.tdRight}>
                          {money(p.revenueCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- (Optional) block: latest users --- */}
      {initialUsers?.length ? (
        <section style={{ marginTop: 32, paddingInline: 8 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Recent users</h2>
          <div style={{ overflowX: "auto" }}>
            <table className={`${styles.tableNice} ${styles.tableCompact}`}>
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>ID</th>
                  <th style={{ width: "40%" }}>Login</th>
                  <th style={{ width: "20%" }}>Role</th>
                  <th style={{ width: "30%" }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {initialUsers.slice(0, 10).map((u) => (
                  <tr key={u.id}>
                    <td className={styles.tdRight}>#{u.id}</td>
                    <td>{u.login}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[`badge_${u.role.toLowerCase()}`] || ""
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className={styles.tdRight}>
                      {new Date(u.createdAt).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}

// helper for category titles
function categoryTitle(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("coffee")) return "Coffee";
  if (k.includes("dessert")) return "Desserts";
  if (k.includes("tea")) return "Tea";
  return "Other";
}
