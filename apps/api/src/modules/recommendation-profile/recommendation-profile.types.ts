export type RecommendationProfilePayload = {
  travel_scope?: string | null;
  preferred_styles?: string[];
  preferred_themes?: string[];
  budget_band?: string | null;
  preferred_duration_band?: string | null;
  preferred_group_type?: string | null;
  preferred_departure?: string | null;
  adventure_level?: string | null;
  allow_behavior_tracking?: boolean;
  allow_chat_signals?: boolean;
};

export type RecommendationEventPayload = {
  event_type: string;
  source?: string | null;
  tour_id?: number | null;
  destination?: string | null;
  metadata?: Record<string, unknown> | null;
};
