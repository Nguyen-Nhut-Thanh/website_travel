export type VoucherPayload = {
  code?: string;
  discount_type?: string;
  discount_value?: number | string;
  min_order_value?: number | string | null;
  max_discount_amount?: number | string | null;
  usage_limit?: number | string | null;
  start_date?: string | Date;
  expiry_date?: string | Date;
  status?: number | string;
};
