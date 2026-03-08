import { PublicToursQuery, PublicToursResponse } from "../types/tour";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

function buildQueryString(params: PublicToursQuery) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;

    const normalized = String(value).trim();
    if (!normalized) return;

    searchParams.set(key, normalized);
  });

  return searchParams.toString();
}

export async function getPublicTours(
  params: PublicToursQuery = {},
): Promise<PublicToursResponse> {
  const queryString = buildQueryString(params);
  const endpoint = `${API_BASE}/tours/public${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(endpoint, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách tour");
  }

  return response.json();
}

export async function getHomeTourFeed() {
  const response = await fetch(`${API_BASE}/tours/public/home`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu trang chủ");
  }

  return response.json();
}
