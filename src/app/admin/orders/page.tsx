"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isLoggedIn as isLoggedInRaw,
  getUser as getUserRaw,
  signOut,
} from "@/lib/auth";
import styles from "@/styles/adminButtons.module.css";

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

type DaySection = {
  dayIso: string; // YYYY-MM-DD (UTC)
  totalCents: number;
  orders: AdminOrder[];
};

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const dateFmt = (s: string) => new Date(s).toLocaleString();
const dayTitle = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function errToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "Unknown error";
  }
}

export default function AdminOrdersPage() {
  // --- ключевые флаги, чтобы избежать SSR→CSR рассинхронизации
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<DaySection[]>([]);
  const [err, setErr] = useState<string>("");
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const iAmAdmin = useMemo(
    () => authed && (role || "").toLowerCase() === "admin",
    [authed, role]
  );

  // Маунт: только тут читаем localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const ok = isLoggedInRaw();
      const me = getUserRaw();
      setAuthed(ok);
      setRole(me?.role ?? null);
    } catch {
      setAuthed(false);
      setRole(null);
    }
  }, []);

  // Загрузка данных, только когда знаем что авторизованы как admin
  useEffect(() => {
    if (!mounted) return;
    if (!iAmAdmin) {
      setSections([]);
      setLoading(false);
      return;
    }
    initialLoad(); // eslint-disable-line @typescript-eslint/no-use-before-define
    const onAuth = () => initialLoad();
    window.addEventListener("auth:login", onAuth);
    window.addEventListener("auth:logout", onAuth);
    return () => {
      window.removeEventListener("auth:login", onAuth);
      window.removeEventListener("auth:logout", onAuth);
    };
  }, [mounted, iAmAdmin]);

  async function fetchDays(opts?: {
    cursor?: string | null;
    days?: number;
  }): Promise<DaySection[]> {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const params = new URLSearchParams();
      params.set("days", String(opts?.days ?? 3));
      if (opts?.cursor) params.set("cursor", opts.cursor);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      const daysResp = (json?.data?.days ?? []) as DaySection[];
      setNextBefore(json?.data?.nextBefore ?? null);
      setHasMore(Boolean(json?.data?.hasMore));
      return daysResp;
    } catch (e) {
      setErr(errToString(e));
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function initialLoad() {
    const first = await fetchDays({ days: 3 });
    setSections(first);
  }

  async function loadMore() {
    if (!nextBefore) return;
    const more = await fetchDays({ days: 3, cursor: nextBefore });
    setSections((prev) => [...prev, ...more]);
  }

  // --- Стабильный SSR-рендер (одинаковый HTML до маунта на сервере и в браузере)
  if (!mounted) {
    return <main className="container" />; // пустой контейнер, без ветвлений
  }

  if (!authed) {
    return (
      <main className="container">
        <h1>Admin · Orders</h1>
        <p>You must sign in.</p>
        <p>
          <a href="/signin?next=%2Fadmin%2Forders" className={styles.btn}>
            Sign in
          </a>
        </p>
      </main>
    );
  }

  if (!iAmAdmin) {
    return (
      <main className="container">
        <h1>Admin · Orders</h1>
        <p>Forbidden: admin role required.</p>
        <button className={styles.btn} onClick={() => signOut()}>
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main className="container">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Admin · Orders</h1>
        </div>

        <div className={styles.btnRow}>
          <button
            className={styles.btn}
            onClick={initialLoad}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>
      <div>
        <a href="/admin" className={styles.btnBack}>
          Return
        </a>
      </div>
      {err && <div className={styles.toastErr}>{err}</div>}

      {loading && sections.length === 0 ? (
        <div style={{ marginTop: 16 }}>Loading…</div>
      ) : sections.length === 0 ? (
        <p style={{ marginTop: 16 }}>No orders yet.</p>
      ) : (
        <>
          {sections.map((sec) => (
            <section key={sec.dayIso} style={{ marginTop: 16 }}>
              <h2 style={{ margin: 0, marginBottom: 8 }}>
                {dayTitle(sec.dayIso)}
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Created</th>
                      <th>Total</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Pay by</th>
                      <th>Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.orders.map((o) => {
                      const addr = o.customer
                        ? [
                            o.customer.city,
                            o.customer.street,
                            o.customer.houseNumber,
                          ]
                            .filter(Boolean)
                            .join(", ")
                        : "-";
                      return (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{dateFmt(o.createdAt)}</td>

                          <td>
                            <strong>{money(o.totalCents)}</strong>
                          </td>
                          <td>
                            {o.customer ? (
                              <>
                                <div>{o.customer.login}</div>
                                <div className="muted">#{o.customer.id}</div>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{addr || "-"}</td>
                          <td>{o.customer?.paymentMethod || "-"}</td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {o.items.map((it) => {
                                let adds: string[] = [];
                                try {
                                  adds = JSON.parse(it.additivesJson || "[]");
                                } catch {}
                                return (
                                  <li key={it.id}>
                                    {it.product?.name || "Product"} · {it.size}{" "}
                                    × {it.quantity} — {money(it.unitCents)}
                                    {adds.length ? (
                                      <>
                                        {" "}
                                        —{" "}
                                        <span className="muted">
                                          {adds.join(", ")}
                                        </span>
                                      </>
                                    ) : null}
                                  </li>
                                );
                              })}
                            </ul>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td
                        colSpan={8}
                        style={{ textAlign: "right", fontWeight: 600 }}
                      >
                        Итого за день: {money(sec.totalCents)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            {hasMore ? (
              <button
                className={styles.btn}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load previous days"}
              </button>
            ) : (
              <span className="muted">Больше дней нет.</span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
