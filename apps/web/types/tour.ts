export type TourDestinationItem = {
  visit_order: number;
  location_id: number | null;
  name: string | null;
};

export type TourLocation = {
  location_id: number;
  name: string;
};

export type TourSchedule = {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: number;
  quota: number;
  booked_count: number;
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
  rating_avg: number | null;
  rating_count: number;
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
