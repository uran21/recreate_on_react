//admin/users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getUser, isLoggedIn, signOut } from "@/lib/auth";

type U = {
  id: number; login: string; role: string;
  city?: string|null; street?: string|null; houseNumber?: number|null;
  paymentMethod?: string|null; createdAt?: string;
};

const roleOptions = ["user","admin"] as const;

export default function AdminUsersPage() {
  const [list, setList] = useState<U[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const me = getUser();
  const admin = !!me && (me.role||"").toLowerCase()==="admin";

  async function load() {
    setLoading(true); setErr("");
    try {
      const token = localStorage.getItem("authToken")||"";
      const res = await fetch("/api/admin/users", {
        headers: {accept:"application/json", Authorization: token?`Bearer ${token}`:""},
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error||`HTTP ${res.status}`);
      setList(json?.data?.users || []);
    } catch(e:any){ setErr(String(e?.message||e)); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ if(isLoggedIn()) load(); },[]);

  const filtered = useMemo(()=> {
    const s = q.trim().toLowerCase();
    if(!s) return list;
    return list.filter(u =>
      String(u.login).toLowerCase().includes(s) ||
      String(u.role).toLowerCase().includes(s) ||
      String(u.city||"").toLowerCase().includes(s) ||
      String(u.street||"").toLowerCase().includes(s)
    );
  },[q,list]);

  if (!isLoggedIn())
    return (<main className="container"><h1>Admin · Users</h1><a className="btn" href="/signin?next=%2Fadmin%2Fusers">Sign in</a></main>);
  if (!admin)
    return (<main className="container"><h1>Admin · Users</h1><p>Forbidden.</p><button className="btn" onClick={signOut}>Sign out</button></main>);

  async function onCreate() {
    const login = prompt("Login (letters+digits, ≥3, start with letter):");
    const password = prompt("Temp password (≥6, ≥1 special):");
    if (!login || !password) return;
    await mutate("POST", { login, password });
  }

  async function onEdit(u: U) {
    const role = prompt(`Role [user/admin]:`, u.role) || u.role;
    const paymentMethod = prompt(`Payment method [cash/card or empty]:`, u.paymentMethod||"") || null;
    await mutate("PATCH", { role, paymentMethod }, u.id);
  }

  async function onDelete(u: U) {
    if (!confirm(`Delete user "${u.login}"? This cannot be undone.`)) return;
    await mutate("DELETE", null, u.id);
  }

  async function mutate(method: "POST"|"PATCH"|"DELETE", body?: any, id?: number) {
    setErr("");
    try {
      const token = localStorage.getItem("authToken")||"";
      const url = id ? `/api/admin/users/${id}` : "/api/admin/users";
      const res = await fetch(url, {
        method,
        headers: {
          accept:"application/json",
          Authorization: token?`Bearer ${token}`:"",
          ...(method!=="DELETE" ? {"Content-Type":"application/json"} : {})
        },
        body: method!=="DELETE" ? JSON.stringify(body||{}) : undefined
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      await load();
    } catch(e:any){ setErr(String(e?.message||e)); }
  }

  return (
    <main className="container">
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>Users</h1>
        <div style={{display:"flex",gap:8}}>
          <input className="input" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={load} disabled={loading}>{loading? "Loading…" : "Refresh"}</button>
          <button className="btn" onClick={onCreate}>+ New user</button>
        </div>
      </header>

      {err && <div className="toast toast--err">{err}</div>}

      <div className="table-wrap" style={{overflowX:"auto",marginTop:16}}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Login</th><th>Role</th><th>Address</th><th>Pay by</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const addr = [u.city,u.street,u.houseNumber].filter(Boolean).join(", ");
              return (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.login}</td>
                  <td><span className="badge">{u.role}</span></td>
                  <td>{addr||"-"}</td>
                  <td>{u.paymentMethod||"-"}</td>
                  <td>{u.createdAt? new Date(u.createdAt).toLocaleString():""}</td>
                  <td style={{whiteSpace:"nowrap"}}>
                    <button className="btn" onClick={()=>onEdit(u)}>Edit</button>{" "}
                    <button className="btn" onClick={()=>onDelete(u)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && !loading && <tr><td colSpan={7}>No users.</td></tr>}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .input{padding:8px 10px;border:1px solid #ddd;border-radius:8px}
        .table{width:100%;border-collapse:collapse}
        .table th,.table td{padding:10px 12px;border-bottom:1px solid #eee;vertical-align:top}
        .toast--err{margin-top:12px;background:#ffe8e6;border:1px solid #ffb3ac;padding:10px;border-radius:8px}
      `}</style>
    </main>
  );
}
