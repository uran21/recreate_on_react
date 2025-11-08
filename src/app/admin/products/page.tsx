"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/adminButtons.module.css";
import { isLoggedIn, getUser, signOut } from "@/lib/auth";

type Category = "coffee" | "tea" | "dessert";

type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  category: Category;
  // support both priceCents (number) and price (string/number)
  priceCents?: number;
  price?: string | number | null;
};

// universal helper for safe error text extraction
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unexpected error";
  }
}

export default function AdminProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // auth only on client side — to avoid hydration mismatch
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

  const iAmAdmin = useMemo(
    () => authed && (role || "").toLowerCase() === "admin",
    [authed, role]
  );

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/products?sort=name_asc", {
          cache: "no-store",
          signal,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          setErr(`GET /api/products ${res.status}${text ? ` · ${text}` : ""}`);
          setRows([]);
          return;
        }
        const json = await res.json().catch(() => ({}));

        const raw: unknown = Array.isArray(json)
          ? json
          : (json as any)?.items ?? (json as any)?.data ?? [];

        const list: any[] = Array.isArray(raw) ? raw : [];

        const mapped: ProductRow[] = list.map((p) => ({
          id: Number((p as any).id),
          name: String((p as any).name ?? ""),
          description: (p as any).description ?? null,
          category: String(
            (p as any).category ?? "coffee"
          ).toLowerCase() as Category,
          priceCents:
            typeof (p as any).priceCents === "number"
              ? (p as any).priceCents
              : undefined,
          price: (p as any).price ?? null,
        }));

        setRows(mapped);
      } catch (e) {
        // if it's an AbortError — silently exit
        const isAbort =
          (typeof DOMException !== "undefined" &&
            e instanceof DOMException &&
            e.name === "AbortError") ||
          (typeof e === "object" &&
            e !== null &&
            "name" in e &&
            (e as any).name === "AbortError");

        if (!isAbort) {
          setErr(getErrorMessage(e) || "Load error");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Delete this product permanently?")) return;
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      // allow 204 without a body
      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Delete failed: ${res.status}${text ? ` · ${text}` : ""}`
        );
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(getErrorMessage(e) || "Failed to delete");
    }
  }

  if (!mounted) {
    return (
      <main className="container" style={{ padding: 16 }}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Products</h1>
          </div>
        </header>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="container" style={{ padding: 16 }}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Admin · Products</h1>
          </div>
          <div className={styles.btnRow}>
            <a className={styles.btn} href="/signin?next=%2Fadmin%2Fproducts">
              Sign in
            </a>
          </div>
        </header>
        <p>You are not authorized.</p>
      </main>
    );
  }

  if (!iAmAdmin) {
    return (
      <main className="container" style={{ padding: 16 }}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Admin · Products</h1>
          </div>
          <div className={styles.btnRow}>
            <button className={styles.btn} onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
        <p>Forbidden: admin role required.</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: 16 }}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/admin" className={styles.btnBack}>
            ← Back to Admin
          </a>
          <h1>Products</h1>
        </div>
        <div className={styles.btnRow}>
          <a href="/admin/products/new" className={styles.btn}>
            + New product
          </a>
          <a href="/admin/orders" className={styles.btn}>
            Orders
          </a>
          <a href="/admin/users" className={styles.btn}>
            Users
          </a>
          <button className={styles.btn} onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {err && (
        <div className={styles.toastErr} style={{ marginTop: 12 }}>
          {err}
        </div>
      )}

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ minWidth: 60 }}>ID</th>
              <th style={{ minWidth: 220 }}>Name</th>
              <th style={{ minWidth: 120 }}>Category</th>
              <th style={{ minWidth: 120 }}>Price</th>
              <th style={{ minWidth: 140 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No products</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.category}</td>
                  <td>
                    {typeof r.priceCents === "number"
                      ? `$${(r.priceCents / 100).toFixed(2)}`
                      : r.price ?? "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <a
                      className={styles.btn}
                      href={`/menu#${r.category}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>{" "}
                    <button
                      className={styles.btn}
                      onClick={() => onDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
