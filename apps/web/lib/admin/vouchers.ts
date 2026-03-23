import {
  formatLocalDate,
  formatLocalDateTime,
  formatLocalTime,
} from "@/lib/dateTime";
import { isVoucherExpired } from "@/lib/vouchers";

export type Voucher = {
  voucher_id: number;
  code: string;
  discount_type: string;
  discount_value: number | string;
  min_order_value: number | string;
  max_discount_amount: number | string | null;
  usage_limit: number;
  used_count: number;
  start_date: string;
  expiry_date: string;
  status: number;
};

export type VoucherForm = {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number;
  start_date: string;
  duration_hours: number;
  status: number;
};

export type VoucherStatusFilter = "all" | "active" | "expired";

export function createDefaultVoucherForm(now = new Date()): VoucherForm {
  return {
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: 0,
    max_discount_amount: null,
    usage_limit: 100,
    start_date: formatLocalDateTime(new Date(now.getTime() + 60 * 60 * 1000)),
    duration_hours: 72,
    status: 1,
  };
}

export function buildVoucherForm(voucher: Voucher): VoucherForm {
  return {
    code: voucher.code,
    discount_type: voucher.discount_type,
    discount_value: Number(voucher.discount_value),
    min_order_value: Number(voucher.min_order_value),
    max_discount_amount: voucher.max_discount_amount
      ? Number(voucher.max_discount_amount)
      : null,
    usage_limit: voucher.usage_limit,
    start_date: voucher.start_date.substring(0, 16),
    duration_hours: getVoucherDurationHours(voucher),
    status: voucher.status,
  };
}

export function getVoucherDurationHours(voucher: Voucher) {
  const start = new Date(voucher.start_date);
  const end = new Date(voucher.expiry_date);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export function filterVouchers(
  vouchers: Voucher[],
  searchTerm: string,
  statusFilter: VoucherStatusFilter,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return vouchers.filter((voucher) => {
    const matchesSearch = voucher.code.toLowerCase().includes(normalizedSearch);
    const expired = isVoucherExpired(voucher);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && voucher.status === 1 && !expired) ||
      (statusFilter === "expired" && expired);

    return matchesSearch && matchesStatus;
  });
}

export function buildVoucherPayload(form: VoucherForm) {
  const startDate = new Date(form.start_date);
  const expiryDate = new Date(
    startDate.getTime() + form.duration_hours * 60 * 60 * 1000,
  );

  return {
    ...form,
    usage_limit: Number(form.usage_limit),
    expiry_date: expiryDate.toISOString(),
  };
}

export function getVoucherDateParts(startDate: string, now = new Date()) {
  return {
    minDate: formatLocalDate(now),
    minTime: formatLocalTime(now),
    startDateValue: startDate ? startDate.slice(0, 10) : "",
    startTimeValue: startDate ? startDate.slice(11, 16) : "",
  };
}
