"use client";

import { Calendar, DollarSign, Users } from "lucide-react";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ScheduleStartFields } from "@/components/admin/schedule-shared/ScheduleStartFields";
import { formatDateString, getTodayDate } from "@/components/home/SearchBar/useSearchBar";
import type { ScheduleFormState } from "@/lib/admin/scheduleEditor";
import type { TourInfo } from "@/lib/admin/scheduleDetail";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils";

type Props = {
  form: ScheduleFormState;
  isPast: boolean;
  tourInfo: TourInfo | null;
  onFormChange: (
    updater: (prev: ScheduleFormState) => ScheduleFormState,
  ) => void;
};

export function ScheduleBasicInfoCard({
  form,
  isPast,
  tourInfo,
  onFormChange,
}: Props) {
  const handleStartDateChange = (value: string) => {
    const nextDate = new Date(value);
    if (Number.isNaN(nextDate.getTime())) return;

    const today = getTodayDate();
    if (nextDate <= today) return;

    const endDate = new Date(
      nextDate.getTime() +
        ((tourInfo?.duration_days || 1) - 1) * 24 * 60 * 60 * 1000,
    );

    onFormChange((prev) => ({
      ...prev,
      start_date: formatDateString(nextDate),
      end_date: formatDateString(endDate),
    }));
  };

  return (
    <AdminFormCard
      title="Thong tin co ban & Gia"
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Calendar size={18} />
        </div>
      }
      bodyClassName="space-y-8 p-8"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ScheduleStartFields
          dateValue={form.start_date}
          timeValue={form.start_time}
          minDate={new Date().toISOString().split("T")[0]}
          disabled={isPast}
          dateLabel="Ngay khoi hanh"
          timeLabel="Gio khoi hanh"
          onDateChange={handleStartDateChange}
          onTimeChange={(value) =>
            onFormChange((prev) => ({
              ...prev,
              start_time: value,
            }))
          }
        />

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            So luong cho toi da
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
                  quota:
                    event.target.value === "" ? 0 : Number(event.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            Gia dot khoi hanh (Nguoi lon)
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
                  event.target.value === ""
                    ? 0
                    : parseCurrencyInput(event.target.value);
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
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-50 pt-4">
        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <DollarSign
            size={14}
            className={isPast ? "text-slate-300" : "text-emerald-500"}
          />
          Bang gia chi tiet (VND)
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
                  ? "Nguoi lon"
                  : priceItem.passenger_type === "child"
                    ? "Tre em"
                    : "Em be"}
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
