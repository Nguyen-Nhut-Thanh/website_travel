export type TourListParams = {
  search?: string;
  status?: string;
};

export type PolicyContentsPayload = Record<string, string | null | undefined>;

export type TourAdminPayload = {
  code?: string;
  name?: string;
  summary?: string | null;
  description?: string;
  duration_days?: number | string;
  duration_nights?: number | string;
  base_price?: number | string;
  tour_type?: string;
  departure_location?: number | string;
  transport_id?: number | string;
  status?: number | string | null;
  sightseeing_summary?: string | null;
  cuisine_info?: string | null;
  best_for?: string | null;
  best_time?: string | null;
  transport_info?: string | null;
  promotion_info?: string | null;
  policy_contents?: PolicyContentsPayload;
  destinations?: Array<number | string>;
  images?: string[];
};

export type SchedulePricePayload = {
  passenger_type: string;
  price: number | string;
  currency?: string;
  note?: string | null;
};

export type ScheduleItineraryPayload = {
  day_number?: number;
  title?: string;
  content?: string;
  description?: string;
  meals?: string | null;
  hotel_id?: number | string | null;
  room_type_id?: number | string | null;
  nights?: number | string | null;
};

export type ScheduleAdminPayload = {
  start_date?: string;
  end_date?: string;
  price?: number | string;
  quota?: number | string;
  status?: number | string | null;
  cover_image_url?: string | null;
  prices?: SchedulePricePayload[];
  itinerary?: ScheduleItineraryPayload[];
};
