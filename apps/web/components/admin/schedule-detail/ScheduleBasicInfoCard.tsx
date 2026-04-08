"use client";

import { Calendar, DollarSign, Users } from "lucide-react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import {
  formatDateString,
  getTodayDate,
} from "@/components/home/SearchBar/useSearchBar";
import type { ScheduleFormState } from "@/lib/admin/scheduleEditor";
import type { TourInfo } from "@/lib/admin/scheduleDetail";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";

type Props = {
  form: ScheduleFormState;
  isPast: boolean;
  hasBookings: boolean;
  bookedCount: number;
  originalQuota: number;
  tourInfo: TourInfo | null;
  onFormChange: (
    updater: (prev: ScheduleFormState) => ScheduleFormState,
  ) => void;
};

export function ScheduleBasicInfoCard({
  form,
  isPast,
  hasBookings,
  bookedCount,
  originalQuota,
  tourInfo,
  onFormChange,
}: Props) {
  const minScheduleDate = (() => {
    const base = new Date();
    const cutOffHours = Number(tourInfo?.cut_off_hours ?? 0);
    if (cutOffHours > 0) {
      base.setHours(base.getHours() + cutOffHours);
    }
    return formatDateString(base);
  })();

  const handleStartDateChange = (value: string) => {
    const nextDate = new Date(value);
    if (Number.isNaN(nextDate.getTime())) return;

    const today = getTodayDate();
    const effectiveMinDate = new Date(`${minScheduleDate}T00:00:00`);
    if (nextDate <= today || nextDate < effectiveMinDate) return;

    const durationDays = Number(tourInfo?.duration_days ?? 0) || 1;
    const endDate = new Date(
      nextDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000,
    );

    onFormChange((prev) => ({
      ...prev,
      start_date: formatDateString(nextDate),
      end_date: formatDateString(endDate),
    }));
  };

  return (
    <AdminFormCard
      title="Thông tin cơ bản & Giá"
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Calendar size={18} />
        </div>
      }
      bodyClassName="space-y-8 p-8"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Calendar size={16} className="text-blue-600" />
            Ngày khởi hành
          </label>
          <AdminDatePicker
            value={form.start_date}
            minDate={minScheduleDate}
            disabled={isPast}
            onChange={handleStartDateChange}
          />
          {hasBookings && !isPast ? (
            <p className="px-1 text-xs font-medium text-amber-700">
              Nếu thay đổi ngày hoặc giờ khởi hành, hệ thống sẽ gửi email thông báo đến
              khách đã đặt.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Calendar size={16} className="text-blue-600" />
            Giờ khởi hành
          </label>
          <div className="flex min-h-[64px] flex-col justify-center rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            <input
              type="time"
              disabled={isPast}
              className={`w-full border-0 bg-transparent p-0 text-sm font-bold outline-none focus:ring-0 ${
                isPast ? "cursor-not-allowed text-slate-400" : "text-blue-600"
              }`}
              value={form.start_time}
              onChange={(event) =>
                onFormChange((prev) => ({
                  ...prev,
                  start_time: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            Giá đợt khởi hành (Người lớn)
          </label>
          <div className="relative">
            <DollarSign
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isPast ? "text-slate-300" : "text-emerald-500"
              }`}
            />
            <input
              type="text"
              disabled={isPast}
              className={`w-full rounded-2xl border py-3.5 pl-11 pr-12 font-black shadow-sm outline-none transition-all focus:bg-white ${
                isPast
                  ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700 focus:border-emerald-500"
              }`}
              value={formatCurrencyInput(form.price)}
              placeholder="0"
              onChange={(event) => {
                const value =
                  event.target.value === "" ? 0 : parseCurrencyInput(event.target.value);
                onFormChange((prev) => ({
                  ...prev,
                  price: value,
                  prices: prev.prices.map((item) =>
                    item.passenger_type === "adult"
                      ? { ...item, price: value }
                      : item,
                  ),
                }));
              }}
            />
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black ${
                isPast ? "text-slate-300" : "text-emerald-600"
              }`}
            >
              VND
            </span>
          </div>
          {hasBookings && !isPast ? (
            <p className="px-1 text-xs font-medium text-emerald-700">
              Giá mới chỉ áp dụng cho booking phát sinh sau khi cập nhật. Các booking cũ
              vẫn giữ nguyên đơn giá đã chốt.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            Số lượng chỗ tối đa
          </label>
          <div className="relative">
            <Users
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="number"
              disabled={isPast}
              className={`w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-11 pr-4 font-bold shadow-sm outline-none transition-all focus:border-blue-500 focus:bg-white ${
                isPast ? "cursor-not-allowed text-slate-300" : "text-slate-700"
              }`}
              value={form.quota === 0 ? "" : form.quota}
              placeholder="VD: 20"
              onChange={(event) =>
                onFormChange((prev) => ({
                  ...prev,
                  quota: event.target.value === "" ? 0 : Number(event.target.value),
                }))
              }
            />
          </div>
          {hasBookings && !isPast ? (
            <p className="px-1 text-xs font-medium text-amber-700">
              Đợt này đã có {bookedCount} khách đặt. Nếu chỉnh quota, bạn chỉ được tăng
              cao hơn mức hiện tại {originalQuota}.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-50 pt-4">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <DollarSign size={14} className={isPast ? "text-slate-300" : "text-emerald-500"} />
          Bảng giá chi tiết (VND)
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {form.prices.map((priceItem, index) => (
            <div
              key={priceItem.passenger_type}
              className={`group space-y-2 rounded-2xl border p-4 transition-all ${
                isPast
                  ? "border-slate-100 bg-slate-50"
                  : "border-slate-100 bg-slate-50 hover:border-blue-100 hover:bg-white"
              }`}
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {priceItem.passenger_type === "adult"
                  ? "Người lớn"
                  : priceItem.passenger_type === "child"
                    ? "Trẻ em"
                    : "Em bé"}
              </label>
              <input
                type="text"
                className={`w-full rounded-xl border px-3 py-2 text-sm font-black outline-none transition-all ${
                  isPast || priceItem.passenger_type === "adult"
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                    : "border-slate-200 bg-white text-blue-600 focus:border-blue-500"
                }`}
                value={formatCurrencyInput(priceItem.price)}
                placeholder="0"
                disabled={isPast || priceItem.passenger_type === "adult"}
                onChange={(event) => {
                  const nextPrices = [...form.prices];
                  nextPrices[index].price =
                    event.target.value === ""
                      ? 0
                      : parseCurrencyInput(event.target.value);
                  onFormChange((prev) => ({ ...prev, prices: nextPrices }));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminFormCard>
  );
}
