"use client";

import { useState } from "react";
import { ChevronDown, Utensils } from "lucide-react";
import type { TourItinerary } from "@/types/tour";

type Props = {
  itinerary: TourItinerary[];
};

function decodeMojibakeText(value?: string | null) {
  if (!value) return "";

  if (!/[ÃÆÅÄ]/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

export default function TourItineraryAccordion({ itinerary }: Props) {
  const [openDays, setOpenDays] = useState<number[]>(
    itinerary[0] ? [itinerary[0].day_number] : [],
  );

  const toggleDay = (dayNumber: number) => {
    setOpenDays((current) =>
      current.includes(dayNumber)
        ? current.filter((item) => item !== dayNumber)
        : [...current, dayNumber],
    );
  };

  return (
    <section className="bg-white pt-4 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-extrabold uppercase text-slate-900">
          Lịch trình
        </h2>

        {itinerary.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            Chưa có lịch trình chi tiết cho ngày khởi hành này.
          </div>
        ) : (
          <div className="space-y-2">
            {itinerary.map((day) => {
              const isOpen = openDays.includes(day.day_number);

              return (
                <div
                  key={`${day.day_number}-${day.title}`}
                  className="overflow-hidden rounded-md border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day.day_number)}
                    className={`flex w-full items-center justify-between px-4 py-4 text-left ${
                      isOpen ? "bg-[#f5f5f5]" : "bg-[#fafafa]"
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 md:text-[15px]">
                        {`Ngày ${day.day_number}: ${decodeMojibakeText(day.title)}`}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Utensils className="h-3.5 w-3.5" />
                        <span>{decodeMojibakeText(day.meals) || "Theo chương trình"}</span>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="flex gap-4 bg-white px-4 py-5 md:px-6">
                      <div className="ml-2 hidden border-l-2 border-dashed border-[#0b63b6] sm:block" />

                      <div className="flex-1">
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                          {decodeMojibakeText(day.content)}
                        </p>

                        <div className="mt-5">
                          <p className="mb-2 text-sm font-bold italic text-[#ef3b2d]">
                            Lưu ý:
                          </p>
                          <ul className="list-disc space-y-2 pl-5 text-xs italic leading-6 text-[#ef3b2d]">
                            <li>
                              Chương trình có thể thay đổi theo điều kiện thực tế
                              nhưng vẫn đảm bảo các điểm tham quan chính.
                            </li>
                            <li>
                              Quý khách vui lòng mang theo giấy tờ tùy thân bản
                              gốc khi tham gia tour.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
