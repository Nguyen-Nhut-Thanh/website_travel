export type FeaturedTourItem = {
  schedule_id: number;
  tour_id: number;
  code: string;
  name: string;
  route_text: string;
  departure_name: string;
  destination_name: string;
  start_date: string;
  hotel_name: string | null;
  transport_name: string | null;
  transport_type: string | null;
  price: number;
  cover_image_url: string | null;
  image_url: string | null;
  link: string;
};

export type FeaturedTourResponse = {
  items: FeaturedTourItem[];
  total: number;
  fetched_at: string;
};
