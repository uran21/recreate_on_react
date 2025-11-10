"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type City = { id: number; name: string };
type Street = { id: number; name: string };

const reLogin = /^[A-Za-z][A-Za-z0-9]{2,}$/; 
const rePassword = /^(?=.*[^\w\s]).{6,}$/; 

type Errs = Partial<{
  login: string;
  password: string;
  confirm: string;
  city: string;
  street: string;
  houseNumber: string;
}>;

type Ctx = {
  login?: string;
  password?: string;
  confirm?: string;
  cityId?: number | "";
  streetId?: number | "";
  houseNumber?: number | "";
};

export default function RegisterClient() {
  const router = useRouter();
  const sp = useSearchParams();


  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [houseNumber, setHouseNumber] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [cityId, setCityId] = useState<number | "">("");
  const [streetId, setStreetId] = useState<number | "">("");

 
  const [cities, setCities] = useState<City[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [errs, setErrs] = useState<Errs>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (k: keyof Errs) =>
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

    const validateField = (key: keyof Errs, ctx: Ctx = {}): string => {
    const vLogin = ctx.login ?? login;
    const vPass = ctx.password ?? password;
    const vConf = ctx.confirm ?? confirm;
    const vCity = ctx.cityId ?? cityId;
    const vStreet = ctx.streetId ?? streetId;
    const vHouse = ctx.houseNumber ?? houseNumber;

    switch (key) {
      case "login":
        if (!vLogin || !reLogin.test(vLogin.trim())) {
          return "At least 3 characters, start with a letter, only English letters and numbers.";
        }
        return "";
      case "password":
        if (!vPass || !rePassword.test(vPass)) {
          return "At least 6 characters and at least 1 special character.";
        }
        return "";
      case "confirm":
        if (!vConf || vConf !== vPass) {
          return "Passwords do not match.";
        }
        return "";
      case "city":
        if (!vCity) return "Select your city.";
        return "";
      case "street":
        if (!vStreet) return "Select your street.";
        return "";
      case "houseNumber": {
        if (vHouse === "" || typeof vHouse !== "number") {
          return "Enter a valid house number (integer ≥ 1).";
        }
         if (!Number.isInteger(vHouse) || vHouse < 1) {
          return "Enter a valid house number (integer ≥ 1).";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const revalidate = (keys: (keyof Errs)[], ctx: Ctx = {}) => {
    setErrs((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (touched[k] || k === "confirm") {
          const msg = validateField(k, ctx);
          if (msg) next[k] = msg;
          else delete next[k];
        }
      });
      return next;
    });
  };

  const formValid =
    !validateField("login") &&
    !validateField("password") &&
    !validateField("confirm") &&
    !validateField("city") &&
    !validateField("street") &&
    !validateField("houseNumber");

   useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("authToken")) {
      router.replace("/menu");
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/cities", { cache: "no-store" });
      const json = await res.json();
      const list: City[] = json?.data ?? [];
      setCities(list);
      if (list.length) setCityId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!cityId) {
        setStreets([]);
        setStreetId("");
        return;
      }
      const res = await fetch(`/api/streets?cityId=${cityId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const list: Street[] = json?.data ?? [];
      setStreets(list);
      setStreetId(list[0]?.id ?? "");
    })();
    if (touched.city) revalidate(["city"], { cityId });
    if (touched.street) revalidate(["street"], { streetId });
  }, [cityId]);

  const onLoginChange = (val: string) => {
    setLogin(val);
    if (!touched.login) markTouched("login");
    revalidate(["login"], { login: val });
  };

  const onPasswordChange = (val: string) => {
    setPassword(val);
    if (!touched.password) markTouched("password");
    revalidate(["password", "confirm"], { password: val, confirm });
  };

  const onConfirmChange = (val: string) => {
    setConfirm(val);
    if (!touched.confirm) markTouched("confirm");
    revalidate(["confirm"], { confirm: val, password });
  };

  const onCityChange = (val: number) => {
    setCityId(val);
    if (!touched.city) markTouched("city");
    revalidate(["city"], { cityId: val });
  };

  const onStreetChange = (val: number) => {
    setStreetId(val);
    if (!touched.street) markTouched("street");
    revalidate(["street"], { streetId: val });
  };

  const onHouseChange = (val: string) => {
    const n = Number(val);
    const next = Number.isNaN(n) ? "" : n;
    setHouseNumber(next);
    if (!touched.houseNumber) markTouched("houseNumber");
    revalidate(["houseNumber"], { houseNumber: next });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      login: true,
      password: true,
      confirm: true,
      city: true,
      street: true,
      houseNumber: true,
    });
    revalidate([
      "login",
      "password",
      "confirm",
      "city",
      "street",
      "houseNumber",
    ]);
    if (!formValid || submitting) return;

    setToast(null);
    try {
      setSubmitting(true);
      const body = {
        login: login.trim(),
        password,
        cityId,
        streetId,
        houseNumber: Number(houseNumber),
        paymentMethod,
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      const token = json?.data?.access_token;
      const user = json?.data?.user;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user || {}));
        window.dispatchEvent(new Event("auth:login"));
        setToast({ msg: "Registration successful", ok: true });
        const next = sp.get("next");
        setTimeout(() => router.replace(next || "/menu"), 600);
      } else {
        setToast({ msg: "Registration successful. Please sign in.", ok: true });
        setTimeout(() => router.replace("/signin"), 600);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : String(err ?? "Registration failed");
      if (/exists|login/i.test(msg)) {
        setErrs((e) => ({ ...e, login: msg }));
        setTouched((t) => ({ ...t, login: true }));
      }
      setToast({ msg, ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container auth">
      <h1>Registration</h1>

      <form onSubmit={onSubmit} noValidate>
        <div className="grid reg-grid">
          <div className="field col-login">
            <label className="label" htmlFor="login">
              Login
            </label>
            <input
              id="login"
              className={`input ${
                touched.login && errs.login ? "is-invalid" : ""
              }`}
              value={login}
              onChange={(e) => onLoginChange(e.target.value)}
              onBlur={() => markTouched("login")}
              autoComplete="username"
              placeholder="Placeholder"
            />
            <div className="err">{touched.login ? errs.login || "" : ""}</div>
          </div>

          <div className="field col-password">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`input ${
                touched.password && errs.password ? "is-invalid" : ""
              }`}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={() => markTouched("password")}
              autoComplete="new-password"
              placeholder="Placeholder"
            />
            <div className="err">
              {touched.password ? errs.password || "" : ""}
            </div>
          </div>

          <div className="field col-confirm">
            <label className="label" htmlFor="confirm">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              className={`input ${
                touched.confirm && errs.confirm ? "is-invalid" : ""
              }`}
              value={confirm}
              onChange={(e) => onConfirmChange(e.target.value)}
              onBlur={() => markTouched("confirm")}
              autoComplete="new-password"
              placeholder="Placeholder"
            />
            <div className="err">
              {touched.confirm ? errs.confirm || "" : ""}
            </div>
          </div>

          <div className="field col-city">
            <label className="label" htmlFor="city">
              City
            </label>
            <select
              id="city"
              className={`input ${
                touched.city && errs.city ? "is-invalid" : ""
              }`}
              value={cityId}
              onChange={(e) => onCityChange(Number(e.target.value))}
              onBlur={() => markTouched("city")}
            >
              <option value="">Select city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="err">{touched.city ? errs.city || "" : ""}</div>
          </div>

           <div className="field col-street">
            <label className="label" htmlFor="street">
              Street
            </label>
            <select
              id="street"
              className={`input ${
                touched.street && errs.street ? "is-invalid" : ""
              }`}
              value={streetId}
              onChange={(e) => onStreetChange(Number(e.target.value))}
              onBlur={() => markTouched("street")}
              disabled={!cityId}
            >
              <option value="">Select street…</option>
              {streets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="err">{touched.street ? errs.street || "" : ""}</div>
          </div>

          <div className="field col-house">
            <label className="label" htmlFor="houseNumber">
              House number
            </label>
            <input
              id="houseNumber"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className={`input ${
                touched.houseNumber && errs.houseNumber ? "is-invalid" : ""
              }`}
              value={houseNumber}
              onChange={(e) => onHouseChange(e.target.value)}
              onBlur={() => markTouched("houseNumber")}
              placeholder="Placeholder"
            />
            <div className="err">
              {touched.houseNumber ? errs.houseNumber || "" : ""}
            </div>
          </div>
          <div className="field col-pay">
            <span className="label">Pay by</span>
            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />{" "}
                Cash
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />{" "}
                Card
              </label>
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn-reg"
            id="btnRegister"
            type="submit"
            disabled={submitting || !formValid}
          >
            Registration
          </button>
        </div>

        {toast && (
          <div className={`toast ${toast.ok ? "toast--ok" : "toast--err"}`}>
            {toast.msg}
          </div>
        )}
      </form>
    </main>
  );
}
