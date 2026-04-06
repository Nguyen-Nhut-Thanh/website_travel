export type FlashDealPayload = {
  tour_schedule_id?: number | string;
  discount_type?: string;
  discount_value?: number | string;
  start_date?: string | Date;
  end_date?: string | Date;
  status?: number | string;
};
