import type { Banner } from "../types/banner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:4000";

export async function getPublicBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch banners. Status:", res.status);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    console.error("Invalid banners response:", data);
    return [];
  } catch (error) {
    console.error("getPublicBanners fetch error:", error);
    return [];
  }
}
