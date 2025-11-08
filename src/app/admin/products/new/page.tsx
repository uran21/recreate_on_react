"use client";

import React, { useEffect, useMemo, useState } from "react";
import { isLoggedIn, getUser, signOut } from "@/lib/auth";
import styles from "@/styles/adminButtons.module.css";

type Category = "coffee" | "tea" | "dessert";
type SizeKey = "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
const SIZE_OPTIONS: SizeKey[] = ["s", "m", "l", "xl", "xxl", "xxxl"];

type SizeRow = {
  key: SizeKey;
  label?: string | null;
  priceDollars: number;
  discountPriceDollars?: number | null;
};

function unitByCategory(cat: Category): "ml" | "g" {
  return cat === "dessert" ? "g" : "ml";
}
function keyToDefaultLabel(k: SizeKey, unit: "ml" | "g"): string {
  switch (k) {
    case "s":
      return `200 ${unit}`;
    case "m":
      return `300 ${unit}`;
    case "l":
      return `400 ${unit}`;
    case "xl":
      return `500 ${unit}`;
    case "xxl":
      return `600 ${unit}`;
    case "xxxl":
      return `700 ${unit}`;
  }
}

function errToString(e: unknown) {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "Unknown error";
  }
}

export default function AdminProductNewPage() {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("coffee");

  const [assetFileName, setAssetFileName] = useState("");
  const imageUrl = assetFileName ? `/assets/menu/${assetFileName}` : "";

  const [sizes, setSizes] = useState<SizeRow[]>([
    {
      key: "s",
      label: "200 ml",
      priceDollars: 12.5,
      discountPriceDollars: null,
    },
  ]);
  const [defaultKey, setDefaultKey] = useState<SizeKey>("s");
  const [isAvailable, setIsAvailable] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!sizes.find((s) => s.key === defaultKey) && sizes.length > 0) {
      setDefaultKey(sizes[0].key);
    }
  }, [sizes, defaultKey]);

  function availableKeys(): SizeKey[] {
    const used = new Set<SizeKey>(sizes.map((s) => s.key));
    return SIZE_OPTIONS.filter((k) => !used.has(k));
  }
  function nextSizeKey(): SizeKey {
    const candidates = availableKeys();
    return candidates.length ? candidates[0] : "xxxl";
  }
  function addSize(): void {
    const k = nextSizeKey();
    const unit = unitByCategory(category);
    setSizes((prev) => [
      ...prev,
      {
        key: k,
        label: keyToDefaultLabel(k, unit),
        priceDollars: 0,
        discountPriceDollars: null,
      },
    ]);
  }
  function removeSize(idx: number): void {
    setSizes((prev) => prev.filter((_, i) => i !== idx));
  }
  function changeSizeKey(idx: number, key: SizeKey): void {
    setSizes((prev) => {
      const unit = unitByCategory(category);
      return prev.map((s, i) => {
        if (i !== idx) return s;
        const wasLabel = (s.label ?? "").trim().toLowerCase();
        const autoDefault = wasLabel.endsWith(" ml") || wasLabel.endsWith(" g");
        const newLabel =
          !s.label || autoDefault ? keyToDefaultLabel(key, unit) : s.label;
        return { ...s, key, label: newLabel };
      });
    });
    if (defaultKey === sizes[idx].key) setDefaultKey(key);
  }
  function updateSize(idx: number, patch: Partial<SizeRow>): void {
    setSizes((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    if (!name.trim()) return setMsg("Please enter a name");
    if (!assetFileName.trim())
      return setMsg("Specify an image file name (e.g., coffee-9.jpg)");
    if (sizes.length === 0) return setMsg("Add at least one size");
    if (!sizes.some((s) => s.key === defaultKey)) setDefaultKey(sizes[0].key);

    for (const s of sizes) {
      if (!String(s.key).trim()) return setMsg("Each size must have a key");
      if (!(s.priceDollars > 0)) return setMsg("Price must be greater than 0");
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      category,
      image: imageUrl,
      isAvailable,
      sizes: sizes.map((s) => ({
        key: s.key,
        label: (s.label ?? "").trim() || null,
        priceCents: Math.round(Number(s.priceDollars) * 100),
        discountPriceCents:
          s.discountPriceDollars != null
            ? Math.round(Number(s.discountPriceDollars) * 100)
            : null,
      })),
      defaultSizeKey: defaultKey || null,
    };

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken") || "";
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setMsg("Created! Open the menu to verify.");
    } catch (e) {
      setMsg(errToString(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <main className="container" style={{ padding: 16 }}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>New Product</h1>
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
            <h1>Admin · New Product</h1>
          </div>
          <div className={styles.btnRow}>
            <a
              className={styles.btn}
              href="/signin?next=%2Fadmin%2Fproducts%2Fnew"
            >
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
            <h1>Admin · New Product</h1>
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
            Return
          </a>
          <h1>New Product</h1>
        </div>
        <div className={styles.btnRow}>
          <a href="/admin/orders" className={styles.btn}>
            Orders
          </a>
          <a href="/admin/users" className={styles.btn}>
            Users
          </a>
          <button className={styles.btn} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 760, marginTop: 12 }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <label>Name *</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Latte, Irish coffee..."
            aria-label="Product name"
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Description</label>
          <textarea
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
            aria-label="Product description"
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Category *</label>
          <select
            className="input"
            value={category}
            onChange={(e) => {
              const next = e.target.value as Category;
              setCategory(next);
              setSizes((prev) =>
                prev.map((s) => {
                  const unit = unitByCategory(next);
                  const lbl = (s.label ?? "").trim().toLowerCase();
                  const autoDefault = lbl.endsWith(" ml") || lbl.endsWith(" g");
                  if (!s.label || autoDefault) {
                    return { ...s, label: keyToDefaultLabel(s.key, unit) };
                  }
                  return s;
                })
              );
            }}
            aria-label="Category"
          >
            <option value="coffee">coffee</option>
            <option value="tea">tea</option>
            <option value="dessert">dessert</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Image (only from /assets/menu)</label>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ opacity: 0.7 }}>/assets/menu/</span>
              <input
                className="input"
                style={{ flex: 1 }}
                value={assetFileName}
                onChange={(e) =>
                  setAssetFileName(e.target.value.replace(/^\//, ""))
                }
                placeholder="coffee-9.jpg"
                aria-label="Asset file name"
              />
            </div>
            {imageUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={imageUrl}
                  alt="preview"
                  width={96}
                  height={96}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                  onError={() =>
                    setMsg(
                      `Image not found at ${imageUrl}. Make sure the file is in /public/assets/menu`
                    )
                  }
                />
                <code style={{ fontSize: 12, color: "#666" }}>{imageUrl}</code>
              </div>
            )}
            <small className="muted">
              Place the file in <code>/public/assets/menu</code>. The database
              will store the path as <code>/assets/menu/&lt;file&gt;</code>.
            </small>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Sizes</strong>
            <button type="button" className={styles.btn} onClick={addSize}>
              + Add size
            </button>
          </div>

          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Default</th>
                  <th>Key *</th>
                  <th>Label</th>
                  <th>Price ($) *</th>
                  <th>Discount ($)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s, i) => {
                  const opts = [s.key, ...availableKeys()].filter(
                    (v, idx, arr) => arr.indexOf(v) === idx
                  );
                  return (
                    <tr key={i}>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="radio"
                          name="defaultSize"
                          checked={defaultKey === s.key}
                          onChange={() => setDefaultKey(s.key)}
                          title="Make default size"
                        />
                      </td>
                      <td>
                        <select
                          className="input"
                          value={s.key}
                          onChange={(e) =>
                            changeSizeKey(i, e.target.value as SizeKey)
                          }
                          style={{ minWidth: 110 }}
                          aria-label="Size key"
                        >
                          {opts.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="input"
                          value={s.label ?? ""}
                          onChange={(e) =>
                            updateSize(i, { label: e.target.value })
                          }
                          placeholder={
                            unitByCategory(category) === "ml"
                              ? "200 ml"
                              : "100 g"
                          }
                          style={{ minWidth: 140 }}
                          aria-label="Size label"
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          value={s.priceDollars}
                          onChange={(e) =>
                            updateSize(i, {
                              priceDollars: Number(e.target.value),
                            })
                          }
                          min={0.01}
                          step={0.01}
                          style={{ minWidth: 120 }}
                          aria-label="Price in dollars"
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          value={s.discountPriceDollars ?? ""}
                          onChange={(e) =>
                            updateSize(i, {
                              discountPriceDollars:
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                            })
                          }
                          min={0}
                          step={0.01}
                          style={{ minWidth: 130 }}
                          aria-label="Discount price in dollars"
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className={styles.btn}
                          onClick={() => removeSize(i)}
                          disabled={sizes.length <= 1}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="muted" style={{ marginTop: 6 }}>
              * The price displayed on the card is taken from “Default” (if not
              selected — from the cheapest size).
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <a href="/admin" className={styles.btn}>
            Return
          </a>
          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? "Creating…" : "Create product"}
          </button>
        </div>

        {msg && (
          <div className={styles.toastErr} style={{ marginTop: 8 }}>
            {msg}
          </div>
        )}
      </form>
    </main>
  );
}
