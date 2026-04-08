import { formatDateString } from "@/components/home/SearchBar/useSearchBar";

export type SchedulePriceItem = {
  passenger_type: "adult" | "child" | "infant";
  price: number;
  currency: string;
  note: string;
};

export type ItineraryFormItem = {
  day_number: number;
  title: string;
  content: string;
  meals: string;
  transport_id: string | number;
  hotel_id: string | number;
  room_type_id: string | number;
};

export type ScheduleFormState = {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  price: number;
  quota: number;
  status: number;
  cover_image_url: string;
  note: string;
  prices: SchedulePriceItem[];
  itinerary: ItineraryFormItem[];
};

type ScheduleDetailResponse = {
  start_date?: string | null;
  end_date?: string | null;
  price?: number | null;
  quota?: number | null;
  status?: number | null;
  cover_image_url?: string | null;
  note?: string | null;
  tour_schedule_prices?: SchedulePriceItem[] | null;
  tour_itineraries?: Array<Partial<ItineraryFormItem> & { hotel_id?: number | null }> | null;
  tour_schedule_hotels?: Array<{
    day_from?: number | null;
    day_to?: number | null;
    hotel_id?: number | null;
    room_type_id?: number | null;
    nights?: number | null;
  }> | null;
};

export const DEFAULT_SCHEDULE_PRICES: SchedulePriceItem[] = [
  { passenger_type: "adult", price: 0, currency: "VND", note: "Giá người lớn" },
  { passenger_type: "child", price: 0, currency: "VND", note: "Giá trẻ em" },
  { passenger_type: "infant", price: 0, currency: "VND", note: "Giá em bé" },
];

export function createEmptyItineraryDay(dayNumber: number): ItineraryFormItem {
  return {
    day_number: dayNumber,
    title: "",
    content: "",
    meals: "",
    transport_id: "",
    hotel_id: "",
    room_type_id: "",
  };
}

export function createDefaultScheduleForm(): ScheduleFormState {
  return {
    start_date: "",
    start_time: "08:00",
    end_date: "",
    end_time: "17:00",
    price: 0,
    quota: 20,
    status: 1,
    cover_image_url: "",
    note: "",
    prices: DEFAULT_SCHEDULE_PRICES.map((item) => ({ ...item })),
    itinerary: [],
  };
}

export function formatTimeValue(value?: string | Date | null) {
  if (!value) return "08:00";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "08:00";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildScheduleFormFromResponse(
  data: ScheduleDetailResponse,
): ScheduleFormState {
  const startDt = data.start_date ? new Date(data.start_date) : null;
  const endDt = data.end_date ? new Date(data.end_date) : null;
  const hotelByDay = new Map<number, { hotel_id: string | number; room_type_id: string | number }>();

  data.tour_schedule_hotels?.forEach((item, index) => {
    const dayNumber = Number(item.day_from ?? item.day_to ?? index + 1);
    if (!dayNumber || hotelByDay.has(dayNumber)) return;

    hotelByDay.set(dayNumber, {
      hotel_id: item.hotel_id ?? "",
      room_type_id: item.room_type_id ?? "",
    });
  });

  return {
    start_date: startDt ? formatDateString(startDt) : "",
    start_time: startDt ? formatTimeValue(startDt) : "08:00",
    end_date: endDt ? formatDateString(endDt) : "",
    end_time: endDt ? formatTimeValue(endDt) : "17:00",
    price: data.price ?? 0,
    quota: data.quota ?? 20,
    status: data.status ?? 1,
    cover_image_url: data.cover_image_url ?? "",
    note: data.note ?? "",
    prices: data.tour_schedule_prices?.length
      ? data.tour_schedule_prices
      : DEFAULT_SCHEDULE_PRICES.map((item) => ({ ...item })),
    itinerary:
      data.tour_itineraries?.map((item, index) => ({
        day_number: item.day_number ?? index + 1,
        title: item.title ?? "",
        content: item.content ?? "",
        meals: item.meals ?? "",
        transport_id: item.transport_id ?? "",
        hotel_id: item.hotel_id ?? hotelByDay.get(item.day_number ?? index + 1)?.hotel_id ?? "",
        room_type_id:
          item.room_type_id ??
          hotelByDay.get(item.day_number ?? index + 1)?.room_type_id ??
          "",
      })) || [],
  };
}

export function ensureItineraryDays(
  itinerary: ItineraryFormItem[],
  durationDays: number,
) {
  if (!durationDays || durationDays < 1) {
    return itinerary;
  }

  const normalized = [...itinerary];
  const nextDays: ItineraryFormItem[] = [];

  for (let day = 1; day <= durationDays; day += 1) {
    const currentDay = normalized.find((item) => item.day_number === day);
    nextDays.push(currentDay || createEmptyItineraryDay(day));
  }

  return nextDays;
}

export function buildScheduleDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export function buildSchedulePayload(form: ScheduleFormState) {
  return {
    ...form,
    start_date: buildScheduleDateTime(form.start_date, form.start_time),
    end_date: buildScheduleDateTime(form.end_date, form.end_time),
    itinerary: form.itinerary.map((item) => ({
      ...item,
      transport_id: item.transport_id ? Number(item.transport_id) : null,
      hotel_id: item.hotel_id ? Number(item.hotel_id) : null,
      room_type_id: item.room_type_id ? Number(item.room_type_id) : null,
    })),
  };
}
