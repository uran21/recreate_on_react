type HttpOptions = RequestInit & { auth?: boolean };

export async function http<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const isAbsolute = /^https?:\/\//i.test(path);
  const isInternal = path.startsWith("/api/");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const url = isAbsolute ? path : (isInternal ? path : `${base}${path}`);

  const res = await fetch(url, {
    ...opts,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(opts.headers || {}),
    },
  });

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Expected JSON, got '${ct}'. First bytes: ${text.slice(0, 80)}`);
  }

  const data = await res.json();
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data && (data as any).error) || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return data as T;
}
