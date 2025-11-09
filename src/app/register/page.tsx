// app/register/page.tsx
import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic"; // на случай, если всё ещё будет пытаться пререндерить

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <RegisterClient />
    </Suspense>
  );
}
