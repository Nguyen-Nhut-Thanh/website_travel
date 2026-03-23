export type LocationOption = {
  location_id: number;
  name: string;
  country_code?: string | null;
};

export type TransportOption = {
  transport_id: number;
  name: string;
  transport_type: string;
};

export type TourScheduleSummary = {
  _count?: {
    bookings?: number;
  };
};

export type TourDetailForm = {
  name?: string;
  code?: string;
  description?: string | null;
  tour_type?: string;
  departure_location?: number;
  transport_id?: number;
  destinations?: number[];
  images?: string[] | string;
  duration_days?: number;
  duration_nights?: number;
  sightseeing_summary?: string | null;
  cuisine_info?: string | null;
  promotion_info?: string | null;
  best_for?: string | null;
  cut_off_hours?: number;
  base_price?: number | string;
  tour_schedules?: TourScheduleSummary[];
  tour_destinations?: { location_id: number }[];
  tour_images?: { image_url: string }[];
};

export function normalizeTourDetailForm(tourData: TourDetailForm | null | undefined) {
  if (!tourData) return null;

  return {
    ...tourData,
    destinations:
      tourData.tour_destinations?.map((destination) => destination.location_id) || [],
    images: tourData.tour_images?.map((image) => image.image_url) || [],
  };
}

export function getTotalTourBookings(tourData: TourDetailForm | null | undefined) {
  return (
    tourData?.tour_schedules?.reduce(
      (total, schedule) => total + (schedule._count?.bookings || 0),
      0,
    ) || 0
  );
}
