export type UserProfile = {
  user_id?: number;
  full_name?: string | null;
  phone?: string | null;
  number_id?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  is_staff?: boolean;
  accounts?: {
    email?: string | null;
    hasPassword?: boolean;
  } | null;
};

export type AccountStats = {
  totalBookings?: number;
  totalFavorites?: number;
  upcomingTrips?: number;
  pendingPayments?: number;
};

export type AccountBooking = {
  booking_id: number;
  status: string;
  total_amount: number | string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  tour_schedules: {
    start_date: string;
    tours: {
      name: string;
      tour_images?: { image_url?: string | null }[];
    };
  };
};

export type FavoriteTourItem = {
  tour_id: number;
  tours: {
    tour_id: number;
    name: string;
    status: number;
    base_price: number | string;
    duration_days: number;
    duration_nights: number;
    tour_type: string;
    tour_images?: { image_url?: string | null }[];
    tour_schedules?: { start_date: string }[];
  };
};

export type RecommendationProfile = {
  user_id?: number;
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

export type RecommendationScoreBreakdown = {
  final_score: number;
  content_score: number;
  knowledge_score: number;
  business_score: number;
};

export type RecommendationTourItem = {
  tour_id: number;
  name: string;
  code?: string | null;
  price: number;
  duration_days: number;
  duration_nights: number;
  departure_location?: string | null;
  destination?: string | null;
  image_url?: string | null;
  reasons: string[];
  score_breakdown: RecommendationScoreBreakdown;
};

export type HybridRecommendationResponse = {
  strategy: string;
  total_candidates: number;
  recommendations: RecommendationTourItem[];
};
