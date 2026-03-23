import { API_BASE, getToken } from "@/lib/auth";

type RecommendationEventPayload = {
  event_type: string;
  source?: string;
  tour_id?: number;
  destination?: string;
  metadata?: Record<string, unknown>;
};

export async function trackRecommendationEvent(
  payload: RecommendationEventPayload,
) {
  const token = getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE}/recommendation-profile/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent by design: tracking should never block UX.
  }
}
