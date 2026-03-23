export type TourDestinationItem = {
  visit_order: number;
  location_id: number | null;
  name: string | null;
  note?: string | null;
  locations?: {
    location_id: number;
    name: string;
    slug?: string | null;
  } | null;
};

export type TourLocation = {
  location_id: number;
  name: string;
  slug?: string | null;
};

export type TourItinerary = {
  day_number: number;
  title: string;
  content: string;
  meals?: string | null;
};

export type TourSchedulePrice = {
  passenger_type: string;
  price: number;
  currency: string;
  note?: string | null;
};

export type TourSchedule = {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: number;
  original_price?: number;
  quota: number;
  booked_count: number;
  cover_image_url?: string | null;
  tour_itineraries?: TourItinerary[];
  tour_schedule_prices?: TourSchedulePrice[];
};

export type TourImage = {
  image_id: number;
  image_url: string;
  is_cover: number;
  sort_order: number;
};

export type TourReview = {
  review_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: number;
};

export type PublicTourCard = {
  tour_id: number;
  code: string;
  name: string;
  summary: string | null;
  duration_days: number;
  duration_nights: number;
  base_price: number;
  tour_type: string;
  updated_at: string;
  cover_image: string | null;
  departure_location: TourLocation | null;
  destinations: TourDestinationItem[];
  next_schedule: TourSchedule | null;
  upcoming_schedules?: TourSchedule[];
  transport: {
    name: string;
    type: string;
  } | null;
  rating_avg: number | null;
  rating_count: number;
};

export type PublicTourDetail = {
  tour_id: number;
  code: string;
  name: string;
  summary: string | null;
  description: string | null;
  duration_days: number;
  duration_nights: number;
  base_price: number;
  tour_type: string;
  sightseeing_summary: string | null;
  cuisine_info: string | null;
  best_for: string | null;
  best_time: string | null;
  transport_info: string | null;
  promotion_info: string | null;
  departure_locations?: TourLocation | null;
  tour_images: TourImage[];
  tour_destinations: TourDestinationItem[];
  tour_schedules: TourSchedule[];
  reviews: TourReview[];
};

export type PublicToursFilters = {
  search: string;
  destination: string;
  departure_location: string;
  date_from: string;
  min_price: string;
  max_price: string;
};

export type PublicToursResponse = {
  items: PublicTourCard[];
  take: number;
  skip: number;
  total: number;
  filters: PublicToursFilters;
};

export type PublicToursQuery = {
  search?: string;
  destination?: string;
  departure_location?: string;
  date_from?: string;
  min_price?: string;
  max_price?: string;
  take?: number | string;
  skip?: number | string;
};
