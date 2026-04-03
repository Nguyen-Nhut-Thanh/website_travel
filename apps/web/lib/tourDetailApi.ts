import { TourDetailResponse } from "@/types/tour-detail";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.nhutthanh.id.vn";

export async function getTourDetail(slug: string): Promise<TourDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/tours/${encodeURIComponent(slug)}/detail`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu chi tiết tour");
  }

  return response.json();
}
