import type { ItineraryFormItem, SchedulePriceItem } from "@/lib/admin/scheduleEditor";

export type TourInfo = {
  name?: string | null;
  duration_days?: number | null;
  base_price?: number | string | null;
  cut_off_hours?: number | null;
};

export type HotelItem = {
  hotel_id: number;
  name: string;
  star_rating?: number | null;
};

export type TransportItem = {
  transport_id: number;
  name: string;
  type?: string | null;
};

export type RoomTypeItem = {
  room_type_id: number;
  name: string;
};

export type ScheduleDetailResponse = {
  tour_id?: string | number | null;
  start_date?: string | null;
  end_date?: string | null;
  price?: number | null;
  quota?: number | null;
  booked_count?: number | null;
  status?: number | null;
  cover_image_url?: string | null;
  note?: string | null;
  notificationSent?: boolean;
  hasBookings?: boolean;
  tour_schedule_prices?: SchedulePriceItem[] | null;
  tour_itineraries?: Array<Partial<ItineraryFormItem> & { hotel_id?: number | null }> | null;
};
