"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatLocalDate, formatShortDate, parseDateOnly } from "@/lib/dateTime";

const WEEKDAY_LABELS = ["TH2", "TH3", "TH4", "TH5", "TH6", "TH7", "CN"];
const MONTH_LABELS = [
  "THÁNG 1",
  "THÁNG 2",
  "THÁNG 3",
  "THÁNG 4",
  "THÁNG 5",
  "THÁNG 6",
  "THÁNG 7",
  "THÁNG 8",
  "THÁNG 9",
  "THÁNG 10",
  "THÁNG 11",
  "THÁNG 12",
];

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<Date | null> = Array(startWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

type AdminDatePickerProps = {
  label?: string;
  value: string;
  minDate?: string;
  disabled?: boolean;
  placeholder?: string;
  allowManualInput?: boolean;
  onChange: (date: string) => void;
};

export function AdminDatePicker({
  label,
  value,
  minDate,
  disabled = false,
  placeholder = "Chọn ngày",
  allowManualInput = false,
  onChange,
}: AdminDatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hasValue = value.trim().length > 0;
  const selectedDate = useMemo(
    () => (hasValue ? parseDateOnly(value) : null),
    [hasValue, value],
  );
  const minDateValue = useMemo(
    () => (minDate ? parseDateOnly(minDate) : null),
    [minDate],
  );
  const baseDate = selectedDate ?? minDateValue ?? new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
  );
  const days = useMemo(() => buildCalendarDays(month), [month]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label ? (
        <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Calendar size={16} className="text-blue-600" />
          {label}
        </label>
      ) : null}

      <div className="relative">
        {allowManualInput ? (
          <div>
            <input
              type="date"
              value={value}
              min={minDate}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
              className={`min-h-[64px] flex-1 rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 text-[13px] font-bold text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] outline-none transition [color-scheme:light] ${
                disabled ? "cursor-not-allowed opacity-60" : "hover:border-[#d3ddea] focus:border-[#2f76ff]"
              }`}
            />
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
              setOpen((current) => !current);
            }}
            className={`flex min-h-[64px] w-full items-center justify-between rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 text-left shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition ${
              disabled ? "cursor-not-allowed opacity-60" : "hover:border-[#d3ddea]"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4ff] text-[#2f76ff]">
                <Calendar size={16} />
              </span>
              <span
                className={`pr-2 text-[13px] font-bold leading-5 ${
                  selectedDate ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {selectedDate ? formatShortDate(selectedDate) : placeholder}
              </span>
            </span>
            <ChevronRight
              size={16}
              className={`text-slate-400 transition ${open ? "rotate-90" : ""}`}
            />
          </button>
        )}

        {open && !disabled && (
          <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-[248px] max-w-[calc(100vw-5rem)] rounded-[22px] border border-[#e6edf5] bg-white p-2.5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:w-[260px]">
            <div className="mb-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-base font-black tracking-[0.12em] text-slate-900">
                {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAY_LABELS.map((weekday) => (
                <div key={weekday} className="text-[11px] font-black text-slate-400">
                  {weekday}
                </div>
              ))}

              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-6" />;
                }

                const dayString = formatLocalDate(day);
                const isDisabled = minDateValue ? day < minDateValue : false;
                const isSelected = dayString === value;

                return (
                  <button
                    key={dayString}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(dayString);
                      setOpen(false);
                    }}
                    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-2xl text-[12px] font-bold transition ${
                      isSelected
                        ? "bg-[#2f76ff] text-white shadow-[0_10px_24px_rgba(47,118,255,0.35)]"
                        : isDisabled
                          ? "cursor-not-allowed text-slate-200"
                          : "text-slate-700 hover:bg-[#edf4ff] hover:text-[#2f76ff]"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
