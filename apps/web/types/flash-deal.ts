export type FlashDealItem = {
  schedule_id: number;
  tour_id: number;
  code: string;
  name: string;
  slug: string;
  image_url: string | null;
  departure_name: string;
  start_date: string;
  end_date: string;
  duration_text: string;
  original_price: number;
  sale_price: number;
  seats_left: number;
  discount_percent: number | null;
  countdown_to: string;
  link: string;
  transport_name?: string | null;
  transport_type?: string | null;
  promotion_info: string | null;
  cover_image_url: string | null;
};

export type FlashDealResponse = {
  items: FlashDealItem[];
  total: number;
  fetched_at: string;
};
