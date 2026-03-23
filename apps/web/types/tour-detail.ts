export type TourDetailGalleryItem = {
  imageUrl: string;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
  source: "tour" | "location";
  locationId: number | null;
  locationName: string | null;
};

export type TourDetailSchedulePrice = {
  passengerType: string;
  price: string | number;
  currency: string;
  note: string | null;
};

export type TourDetailScheduleTransport = {
  scheduleTransportId: number;
  role: string;
  dayFrom: number | null;
  dayTo: number | null;
  note: string | null;
  transport: {
    transportId: number;
    name: string;
    type: string;
    capacity: number;
    provider: {
      providerId: number;
      name: string;
      type: string;
    } | null;
  } | null;
};

export type TourDetailItinerary = {
  itineraryId: number;
  dayNumber: number;
  title: string;
  content: string;
  meals: string | null;
};

export type TourDetailSchedule = {
  tourScheduleId: number;
  startDate: string;
  endDate: string;
  price: string | number;
  quota: number;
  bookedCount: number;
  remainingSlots: number;
  coverImageUrl: string | null;
  prices: TourDetailSchedulePrice[];
  transports: TourDetailScheduleTransport[];
  itineraries: TourDetailItinerary[];
};

export type TourDetailInfoItem = {
  key: string;
  title: string;
  value: string;
  icon: string;
};

export type TourDetailPolicy = {
  policyId: number;
  type: string;
  title: string;
  content: string;
};

export type TourDetailResponse = {
  tourId: number;
  code: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string;
  durationDays: number;
  durationNights: number;
  basePrice: string | number;
  tourType: string;
  departureLocation: {
    locationId: number;
    name: string;
    slug: string;
  } | null;
  transport: {
    transportId: number;
    name: string;
    type: string;
    capacity: number;
    description: string | null;
    provider: {
      providerId: number;
      name: string;
      type: string;
    } | null;
  } | null;
  gallery: {
    mainImage: string | null;
    items: TourDetailGalleryItem[];
  };
  destinations: Array<{
    visitOrder: number;
    note: string | null;
    location: {
      locationId: number;
      name: string;
      slug: string;
      locationType: string;
      bestTime: string | null;
      tags: string | null;
    };
  }>;
  infoItems: TourDetailInfoItem[];
  schedules: TourDetailSchedule[];
  policies: TourDetailPolicy[];
};
