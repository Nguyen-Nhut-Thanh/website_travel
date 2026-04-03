"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TourSchedule } from "@/types/tour";

type Props = {
  schedules: TourSchedule[];
  selectedScheduleId: number | null;
  onSelect: (scheduleId: number) => void;
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default function TourDepartureCalendar({
  schedules,
  selectedScheduleId,
  onSelect,
}: Props) {
  const monthOptions = useMemo(() => {
    const uniqueMonths = new Map<string, Date>();

    schedules.forEach((schedule) => {
      const date = new Date(schedule.start_date);
      if (Number.isNaN(date.getTime())) return;

      const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      uniqueMonths.set(toMonthKey(monthDate), monthDate);
    });

    const sorted = Array.from(uniqueMonths.values()).sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    return sorted.length ? sorted : [new Date()];
  }, [schedules]);

  const [currentMonth, setCurrentMonth] = useState<Date>(monthOptions[0]);

  useEffect(() => {
    setCurrentMonth(monthOptions[0]);
  }, [monthOptions]);

  const dayCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDayIndex }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [currentMonth]);

  const scheduleMap = useMemo(() => {
    const map = new Map<number, TourSchedule>();

    schedules.forEach((schedule) => {
      const date = new Date(schedule.start_date);
      if (
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      ) {
        map.set(date.getDate(), schedule);
      }
    });

    return map;
  }, [currentMonth, schedules]);

  const currentMonthIndex = monthOptions.findIndex(
    (month) => toMonthKey(month) === toMonthKey(currentMonth),
  );

  return (
    <section id="tour-schedules" className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-[28px] font-extrabold uppercase text-slate-900">
          Lịch khởi hành
        </h2>

        <div className="flex flex-col gap-5 md:flex-row">
          <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 md:w-[138px]">
            <p className="mb-4 text-center text-sm font-bold text-slate-900">
              Chọn tháng
            </p>

            <div className="space-y-2">
              {monthOptions.map((month) => {
                const isActive = toMonthKey(month) === toMonthKey(currentMonth);

                return (
                  <button
                    key={toMonthKey(month)}
                    type="button"
                    onClick={() => setCurrentMonth(month)}
                    className={`w-full rounded-md px-3 py-2.5 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#0b63b6] text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:text-[#0b63b6]"
                    }`}
                  >
                    {`${month.getMonth() + 1}/${month.getFullYear()}`}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_40px_-34px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-center gap-6 border-b border-slate-100 px-4 py-4">
              <button
                type="button"
                onClick={() =>
                  currentMonthIndex > 0 &&
                  setCurrentMonth(monthOptions[currentMonthIndex - 1])
                }
                className="text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={currentMonthIndex <= 0}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-extrabold uppercase text-[#0b63b6]">
                {`Tháng ${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`}
              </h3>

              <button
                type="button"
                onClick={() =>
                  currentMonthIndex < monthOptions.length - 1 &&
                  setCurrentMonth(monthOptions[currentMonthIndex + 1])
                }
                className="rounded-full bg-slate-100 p-1 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                disabled={currentMonthIndex >= monthOptions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-7 gap-y-3">
                {WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className={`text-center text-sm font-bold ${
                      weekday === "T7" || weekday === "CN"
                        ? "text-[#ef3b2d]"
                        : "text-[#0b63b6]"
                    }`}
                  >
                    {weekday}
                  </div>
                ))}

                {dayCells.map((day, index) => {
                  if (day == null) {
                    return <div key={`empty-${index}`} className="h-14" />;
                  }

                  const schedule = scheduleMap.get(day);
                  const isSelected =
                    schedule?.tour_schedule_id === selectedScheduleId;

                  return (
                    <button
                      key={`${currentMonth}-${day}`}
                      type="button"
                      disabled={!schedule}
                      onClick={() =>
                        schedule && onSelect(schedule.tour_schedule_id)
                      }
                      className={`relative flex h-16 flex-col items-center justify-start rounded-md pt-1.5 transition ${
                        schedule
                          ? "cursor-pointer hover:bg-slate-50"
                          : "cursor-default"
                      }`}
                    >
                      <span
                        className={`text-base ${
                          schedule ? "font-medium text-slate-800" : "text-slate-300"
                        }`}
                      >
                        {day}
                      </span>

                      {schedule ? (
                        <span className="mt-1 text-xs font-bold text-[#ef3b2d]">
                          {Math.round(Number(schedule.price) / 1000).toLocaleString(
                            "vi-VN",
                          )}
                          K
                        </span>
                      ) : null}

                      {isSelected ? (
                        <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-[#0b63b6]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-[#fffdf8] px-4 py-3">
              <p className="text-xs italic text-[#ef3b2d]">
                Quý khách vui lòng chọn ngày phù hợp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
