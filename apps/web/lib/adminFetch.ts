//apps/web/lib/adminFetch.ts
export async function adminFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}
