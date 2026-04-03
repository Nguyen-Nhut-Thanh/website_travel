export type FlashDealRecord = {
  deal_id: number;
  discount_type: string;
  discount_value: number | string;
  start_date: string;
  status: number;
};

export type FlashDealSchedule = {
  tour_schedule_id: number;
  start_date: string;
  quota: number;
  price: number | string;
  tours?: {
    code?: string | null;
    name?: string | null;
  } | null;
  _count?: {
    bookings?: number;
  } | null;
  flash_deals?: FlashDealRecord | null;
};

export type FlashDealForm = {
  discount_type: string;
  discount_value: number;
  hours_before: number;
  status: number;
};

export function createDefaultFlashDealForm(): FlashDealForm {
  return {
    discount_type: "percentage",
    discount_value: 0,
    hours_before: 72,
    status: 1,
  };
}

export function buildFlashDealForm(schedule: FlashDealSchedule): FlashDealForm {
  const existingDeal = schedule.flash_deals;

  if (!existingDeal) {
    return createDefaultFlashDealForm();
  }

  const start = new Date(existingDeal.start_date);
  const departure = new Date(schedule.start_date);
  const diffHours = Math.round(
    (departure.getTime() - start.getTime()) / (1000 * 60 * 60),
  );

  return {
    discount_type: existingDeal.discount_type,
    discount_value: Number(existingDeal.discount_value),
    hours_before: diffHours > 0 ? diffHours : 0,
    status: existingDeal.status,
  };
}

export function filterFlashDealSchedules(
  schedules: FlashDealSchedule[],
  searchTerm: string,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return schedules.filter((schedule) => {
    const isUpcoming = new Date(schedule.start_date).getTime() > Date.now();

    if (!isUpcoming) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      schedule.tours?.name?.toLowerCase().includes(normalizedSearch) ||
      schedule.tours?.code?.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function previewFlashDealPrice(
  price: number,
  discountType: string,
  discountValue: number,
) {
  if (!discountValue) {
    return price;
  }

  const rawPrice =
    discountType === "percentage"
      ? price * (1 - discountValue / 100)
      : price - discountValue;

  return Math.max(0, Math.round(rawPrice / 1000) * 1000);
}

export function buildFlashDealPayload(
  schedule: FlashDealSchedule,
  form: FlashDealForm,
) {
  const departureDate = new Date(schedule.start_date);
  const startDate = new Date(
    departureDate.getTime() - (form.hours_before || 72) * 60 * 60 * 1000,
  );

  return {
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    start_date: startDate.toISOString(),
    status: form.status,
    tour_schedule_id: schedule.tour_schedule_id,
  };
}
