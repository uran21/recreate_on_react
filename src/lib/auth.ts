"use client";

export type LoginPayload = { login: string; password: string };
export type User = {
  id: number; login: string; role: string;
  city?: string; street?: string; houseNumber?: number; paymentMethod?: string; createdAt?: string;
};

export const reLogin = /^[A-Za-z][A-Za-z0-9]{2,}$/;
export const rePassword = /^(?=.*[^\w\s]).{6,}$/;

export function isLoggedIn() {
  try { return !!localStorage.getItem("authToken"); } catch { return false; }
}
export function getUser(): User | null {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}
export function signOut() {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:logout"));
    window.dispatchEvent(new Event("cart:updated"));
  } catch {}
}

export async function loginViaApi(payload: LoginPayload) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as { data: { access_token: string; user: User } };
}
