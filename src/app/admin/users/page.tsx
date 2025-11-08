"use client";

import { useEffect, useMemo, useState } from "react";
import { getUser, isLoggedIn, signOut } from "@/lib/auth";
import styles from "@/styles/adminButtons.module.css";

type U = {
  id: number;
  login: string;
  role: string;
  city?: string | null;
  street?: string | null;
  houseNumber?: number | null;
  paymentMethod?: string | null;
  createdAt?: string;
};

type UsersListResp = {
  data?: { users?: U[] };
  message?: string;
  error?: string | null;
};

function errToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "Unknown error";
  }
}

export default function AdminUsersPage() {
  const [list, setList] = useState<U[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const me = getUser();
  const admin = !!me && (me.role || "").toLowerCase() === "admin";

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch("/api/admin/users", {
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        cache: "no-store",
      });
      const json: UsersListResp = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setList(json?.data?.users || []);
    } catch (e) {
      setErr(errToString(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn()) load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (u: U) =>
        String(u.login).toLowerCase().includes(s) ||
        String(u.role).toLowerCase().includes(s) ||
        String(u.city || "")
          .toLowerCase()
          .includes(s) ||
        String(u.street || "")
          .toLowerCase()
          .includes(s)
    );
  }, [q, list]);

  if (!isLoggedIn())
    return (
      <main className="container">
        <h1>Admin · Users</h1>
        <a className={styles.btn} href="/signin?next=%2Fadmin%2Fusers">
          Sign in
        </a>
      </main>
    );

  if (!admin)
    return (
      <main className="container">
        <h1>Admin · Users</h1>
        <p>Forbidden.</p>
        <button className={styles.btn} onClick={signOut}>
          Sign out
        </button>
      </main>
    );

  async function onCreate() {
    const login = prompt(
      "Login (letters+digits, ≥3, start with letter):"
    )?.trim();
    if (!login) return;
    const reLogin = /^[A-Za-z][A-Za-z0-9]{2,}$/;
    if (!reLogin.test(login)) {
      alert("Invalid login format");
      return;
    }

    const password = prompt("Temp password (≥6, ≥1 special):") || "";
    const rePassword = /^(?=.*[^\w\s]).{6,}$/;
    if (!rePassword.test(password)) {
      alert("Invalid password format");
      return;
    }

    await mutate("POST", { login, password });
  }

  async function onEdit(u: U) {
    const role = prompt(`Role [user/admin]:`, u.role)?.trim() || u.role;
    const paymentMethod =
      prompt(
        `Payment method [cash/card or empty]:`,
        u.paymentMethod || ""
      )?.trim() || null;
    await mutate("PATCH", { role, paymentMethod }, u.id);
  }

  async function onResetPassword(u: U) {
    const password =
      prompt(`New password for "${u.login}" (≥6, ≥1 special):`) || "";
    const rePassword = /^(?=.*[^\w\s]).{6,}$/;
    if (!rePassword.test(password)) {
      alert("Invalid password format");
      return;
    }
    await mutate("PATCH", { password }, u.id);
    alert("Password reset.");
  }

  async function onDelete(u: U) {
    if (!confirm(`Delete user "${u.login}"? This cannot be undone.`)) return;
    await mutate("DELETE", null, u.id);
  }

  async function mutate(
    method: "POST" | "PATCH" | "DELETE",
    body?: any,
    id?: number
  ) {
    setErr("");
    try {
      const token = localStorage.getItem("authToken") || "";
      const url = id ? `/api/admin/users/${Number(id)}` : "/api/admin/users";
      const res = await fetch(url, {
        method,
        headers: {
          accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(method !== "DELETE"
            ? { "Content-Type": "application/json" }
            : {}),
        },
        body: method !== "DELETE" ? JSON.stringify(body || {}) : undefined,
      });
      const json: UsersListResp = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setErr(errToString(e));
    }
  }

  return (
    <main className="container">
      <header className={styles.header}>
        <div className={styles.btnRow}>
          <input
            className={styles.input}
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className={styles.btn} onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      {err && <div className={styles.toastErr}>{err}</div>}
      <br />
      <div>
        <div>
          <a href="/admin" className={styles.btnBack}>
            Return
          </a>
          <h1>Users</h1>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Login</th>
              <th>Role</th>
              <th>Address</th>
              <th>Pay by</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u: U) => {
              const addr = [u.city, u.street, u.houseNumber]
                .filter(Boolean)
                .join(", ");
              return (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.login}</td>
                  <td>
                    <span className="badge">{u.role}</span>
                  </td>
                  <td>{addr || "-"}</td>
                  <td>{u.paymentMethod || "-"}</td>
                  <td>
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                  </td>
                  <td className={styles.actions}>
                    <button className={styles.btn} onClick={() => onEdit(u)}>
                      Edit
                    </button>
                    <button
                      className={styles.btn}
                      onClick={() => onResetPassword(u)}
                    >
                      Reset password
                    </button>
                    <button className={styles.btn} onClick={() => onDelete(u)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={7}>No users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
