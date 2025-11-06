"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginViaApi, reLogin, rePassword } from "@/lib/auth";

type FieldErrs = { login?: string; password?: string; };

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = useMemo(() => sp.get("next"), [sp]);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<FieldErrs>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const canSubmit = reLogin.test(login.trim()) && rePassword.test(password);

  useEffect(() => { setToast(null); }, [login, password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setErrs({
        login: reLogin.test(login.trim()) ? "" :
          "Login must start with a letter and contain only English letters and numbers (min 3)",
        password: rePassword.test(password) ? "" :
          "Password must be ≥6 and contain at least 1 special character",
      });
      return;
    }

    setBusy(true);
    setErrs({});
    setToast(null);
    try {
      const res = await loginViaApi({ login: login.trim(), password });
      const token = res?.data?.access_token;
      const user  = res?.data?.user ?? {};
      if (!token) throw new Error("No access token");

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("auth:login"));
      window.dispatchEvent(new Event("cart:updated"));

      setToast({ msg: "Login successful", ok: true });

      setTimeout(() => {
        if (nextUrl) router.push(nextUrl);
        else router.push("/menu");
      }, 500);
    } catch (err: any) {
      const msg = String(err?.message || "Sign-in failed");
      if (/invalid/i.test(msg) || /401/.test(msg)) {
        setErrs({ password: "Incorrect login or password" });
      }
      setToast({ msg, ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container auth">
      <h1>Sign In</h1>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label className="label" htmlFor="login">Login</label>
          <input
            className={`input ${errs.login ? "is-invalid" : ""}`}
            id="login"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            aria-invalid={!!errs.login}
          />
          <div className="err">{errs.login || ""}</div>
        </div>

        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input
            className={`input ${errs.password ? "is-invalid" : ""}`}
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errs.password}
          />
          <div className="err">{errs.password || ""}</div>
        </div>

        <div className="btn-row">
          <button className="btn-signin" type="submit" disabled={!canSubmit || busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>

        {!!toast && (
          <div className={`toast ${toast.ok ? "toast--ok" : "toast--err"}`} aria-live="polite">
            {toast.msg}
          </div>
        )}
      </form>
    </main>
  );
}
