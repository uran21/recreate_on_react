import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic"; // выключаем пререндер

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <SignInClient />
    </Suspense>
  );
}
