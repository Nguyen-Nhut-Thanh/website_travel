import { TOUR_POLICY_DEFINITIONS, type TourPolicyContentMap } from "@/lib/tourPolicyDefinitions";

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
  cuisine_info?: string | null;
  promotion_info?: string | null;
  best_for?: string | null;
  best_time?: string | null;
  policy_contents?: TourPolicyContentMap;
  cut_off_hours?: number;
  base_price?: number | string;
  tour_schedules?: TourScheduleSummary[];
  tour_destinations?: { location_id: number }[];
  tour_images?: { image_url: string }[];
  tour_policies?: {
    policy_id: number;
    policy_type: string;
    content: string;
  }[];
};

export function normalizeTourDetailForm(tourData: TourDetailForm | null | undefined) {
  if (!tourData) return null;

  return {
    ...tourData,
    policy_contents: TOUR_POLICY_DEFINITIONS.reduce<TourPolicyContentMap>((acc, definition) => {
      const matched = tourData.tour_policies?.find(
        (policy) => policy.policy_type === definition.key,
      );
      if (matched?.content) {
        acc[definition.key] = matched.content;
      }
      return acc;
    }, {}),
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
