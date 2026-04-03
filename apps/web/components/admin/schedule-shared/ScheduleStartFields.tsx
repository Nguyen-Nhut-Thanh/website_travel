"use client";

import { Calendar } from "lucide-react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";

type Props = {
  dateValue: string;
  minDate: string;
  disabled?: boolean;
  onDateChange: (value: string) => void;
  timeValue?: string;
  onTimeChange?: (value: string) => void;
  dateLabel?: string;
  timeLabel?: string;
};

export function ScheduleStartFields({
  dateValue,
  minDate,
  disabled = false,
  onDateChange,
  timeValue,
  onTimeChange,
  dateLabel = "Ngay khoi hanh",
  timeLabel = "Gio khoi hanh",
}: Props) {
  const hasTimeField = typeof timeValue === "string" && typeof onTimeChange === "function";

  if (!hasTimeField) {
    return (
      <div className="space-y-2">
        <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Calendar size={16} className="text-blue-600" />
          {dateLabel}
        </label>
        <AdminDatePicker
          value={dateValue}
          minDate={minDate}
          disabled={disabled}
          onChange={onDateChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1.2fr)_210px] gap-3">
        <div className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Calendar size={16} className="text-blue-600" />
          {dateLabel}
        </div>
        <div className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          {timeLabel}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.2fr)_210px] items-start gap-3">
        <AdminDatePicker
          value={dateValue}
          minDate={minDate}
          disabled={disabled}
          onChange={onDateChange}
        />

        <div className="flex min-h-[64px] flex-col justify-center rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <input
            type="time"
            disabled={disabled}
            className={`w-full border-0 bg-transparent p-0 text-sm font-bold outline-none focus:ring-0 ${
              disabled ? "cursor-not-allowed text-slate-400" : "text-blue-600"
            }`}
            value={timeValue}
            onChange={(event) => onTimeChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
