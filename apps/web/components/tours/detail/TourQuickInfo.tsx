"use client";

import { Bus, CloudSun, Map, TicketPercent, Users, Utensils } from "lucide-react";
import type { PublicTourDetail } from "@/types/tour";

type Props = {
  tour: PublicTourDetail;
};

export default function TourQuickInfo({ tour }: Props) {
  const transportText = (() => {
    const transportType = tour.transports?.transport_type?.trim().toLowerCase() || "";
    const transportName = tour.transports?.name?.trim().toLowerCase() || "";

    if (
      transportType.includes("plane") ||
      transportType.includes("flight") ||
      transportType.includes("air") ||
      transportType.includes("máy bay") ||
      transportName.includes("máy bay") ||
      transportName.includes("flight")
    ) {
      return "Máy bay";
    }

    if (!transportType && !transportName) {
      return "";
    }

    return "Xe";
  })();

  const destinationSummary = tour.tour_destinations
    .map((item) => item.locations?.name?.trim() || item.name?.trim())
    .filter((item): item is string => Boolean(item))
    .join(", ");

  const highlightSummary = tour.description?.trim();

  const infoItems = [
    {
      icon: <Map className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />,
      title: "Điểm tham quan",
      desc: destinationSummary,
    },
    {
      icon: <Utensils className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />,
      title: "Ẩm thực",
      desc: tour.cuisine_info?.trim(),
    },
    {
      icon: <Users className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />,
      title: "Phù hợp với",
      desc: tour.best_for?.trim(),
    },
    {
      icon: <CloudSun className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />,
      title: "Thời gian lý tưởng",
      desc: tour.best_time?.trim(),
    },
    {
      icon: <Bus className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />,
      title: "Phương tiện",
      desc: transportText,
    },
    {
      icon: (
        <TicketPercent className="h-7 w-7 text-[#0b63b6]" strokeWidth={1.7} />
      ),
      title: "Khuyến mãi",
      desc: tour.promotion_info?.trim(),
    },
  ];

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-5">
          <h3 className="text-center text-2xl font-black text-slate-900 md:text-[28px]">
            Điểm nổi bật của chương trình
          </h3>
          <div className="rounded-2xl border border-slate-100 bg-[#fbfcfe] p-6">
            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="min-h-[180px] max-h-56 overflow-y-auto text-base leading-8 text-slate-700 custom-scrollbar md:min-h-[220px] md:text-lg">
                {highlightSummary ||
                  "Đang cập nhật thêm những điểm nổi bật của hành trình này."}
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-10 text-center text-2xl font-extrabold uppercase text-slate-900 md:text-[28px]">
          Thông tin thêm về chuyến đi
        </h2>

        <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {infoItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-[#fbfcfe] p-6"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="mb-2 text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-sm leading-6 text-slate-700">
                {item.desc || "Đang cập nhật thêm thông tin"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
