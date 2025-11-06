//admin/analytiscs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { isLoggedIn, getUser, signOut } from "@/lib/auth";

const money = (c:number)=> `$${(c/100).toFixed(2)}`;

export default function SalesPage() {
  const me = getUser();
  const admin = !!me && (me.role||"").toLowerCase()==="admin";
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  const [byDay,setByDay]=useState<{day:string,totalCents:number}[]>([]);
  const [top,setTop]=useState<{name:string,qty:number,revenueCents:number}[]>([]);

  async function load(){
    setLoading(true); setErr("");
    try{
      const token = localStorage.getItem("authToken")||"";
      const res = await fetch("/api/admin/analytics/sales",{headers:{accept:"application/json",Authorization: token?`Bearer ${token}`:""},cache:"no-store"});
      const json = await res.json();
      if(!res.ok) throw new Error(json?.error||`HTTP ${res.status}`);
      setByDay(json?.data?.byDay||[]);
      setTop(json?.data?.topProducts||[]);
    }catch(e:any){ setErr(String(e?.message||e)); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ if(isLoggedIn()) load(); },[]);

  if(!isLoggedIn()) return (<main className="container"><h1>Sales</h1><a className="btn" href="/signin?next=%2Fadmin%2Fanalytics">Sign in</a></main>);
  if(!admin) return (<main className="container"><h1>Sales</h1><p>Forbidden.</p><button className="btn" onClick={signOut}>Sign out</button></main>);

  return (
    <main className="container">
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>Sales</h1>
        <button className="btn" onClick={load} disabled={loading}>{loading?"Loading…":"Refresh"}</button>
      </header>
      {err && <div className="toast toast--err">{err}</div>}

      <section style={{marginTop:16}}>
        <h3>Revenue by day (30d)</h3>
        <div style={{display:"flex",gap:4,alignItems:"end",height:160,border:"1px solid #eee",padding:8,borderRadius:8,overflowX:"auto"}}>
          {byDay.map((d,i)=>{
            const max = Math.max(1,...byDay.map(x=>x.totalCents));
            const h = Math.max(2, Math.round(140 * d.totalCents / max));
            return (
              <div key={i} title={`${d.day}: ${money(d.totalCents)}`} style={{width:10,height:h,background:"#7aa7ff"}} />
            );
          })}
        </div>
      </section>

      <section style={{marginTop:24}}>
        <h3>Top 10 products</h3>
        <table className="table">
          <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead>
          <tbody>
            {top.map((t,i)=>(
              <tr key={i}><td>{i+1}</td><td>{t.name}</td><td>{t.qty}</td><td><strong>{money(t.revenueCents)}</strong></td></tr>
            ))}
            {top.length===0 && <tr><td colSpan={4}>No data.</td></tr>}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .table{width:100%;border-collapse:collapse;margin-top:8px}
        .table th,.table td{padding:8px 10px;border-bottom:1px solid #eee}
        .toast--err{margin-top:12px;background:#ffe8e6;border:1px solid #ffb3ac;padding:10px;border-radius:8px}
      `}</style>
    </main>
  );
}
