// apps/web/lib/adminFetch.ts
import { getToken, API_BASE } from "./auth";

export async function adminFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Đảm bảo path bắt đầu bằng /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}
