import type { FlashDealResponse } from "../types/flash-deal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function getFlashDeals(limit = 8): Promise<FlashDealResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/flash-deals?limit=${limit}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch flash deals: ${response.status}`);
  }

  return response.json();
}
