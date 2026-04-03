import type { HybridRecommendationResponse } from "@/types/account";

const getAiBase = () => {
  if (process.env.NEXT_PUBLIC_AI_BASE) return process.env.NEXT_PUBLIC_AI_BASE;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8000";
  }
  return "https://ai.nhutthanh.id.vn";
};

export const AI_BASE = getAiBase();

type HybridRecommendationRequest = {
  user_id?: number;
  preferred_month?: number;
  group_type?: string | null;
  travel_style?: string | null;
  limit?: number;
};

export async function fetchHybridRecommendations(
  payload: HybridRecommendationRequest,
): Promise<HybridRecommendationResponse> {
  const response = await fetch(`${AI_BASE}/api/recommendations/hybrid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Không thể tải gợi ý AI");
  }

  return (await response.json()) as HybridRecommendationResponse;
}
