"use client";

import { MapPin, Sparkles, Ticket, Utensils } from "lucide-react";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import type { TourDetailForm } from "@/lib/admin/tourDetail";

type Props = {
  tour: TourDetailForm;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export function TourDetailsCard({ tour, onTourChange }: Props) {
  return (
    <AdminFormCard bodyClassName="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <Sparkles size={16} className="text-blue-500" /> Điểm nổi bật
        </h3>
        <textarea
          placeholder="Tóm tắt những điểm tham quan chính..."
          className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          value={tour.sightseeing_summary || ""}
          onChange={(event) =>
            onTourChange((prev) => ({ ...prev, sightseeing_summary: event.target.value }))
          }
        />
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <Utensils size={16} className="text-emerald-500" /> Ẩm thực
        </h3>
        <textarea
          placeholder="Thông tin về các bữa ăn, đặc sản..."
          className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          value={tour.cuisine_info || ""}
          onChange={(event) =>
            onTourChange((prev) => ({ ...prev, cuisine_info: event.target.value }))
          }
        />
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <Ticket size={16} className="text-amber-500" /> Khuyến mãi
        </h3>
        <textarea
          placeholder="Các ưu đãi đi kèm..."
          className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          value={tour.promotion_info || ""}
          onChange={(event) =>
            onTourChange((prev) => ({ ...prev, promotion_info: event.target.value }))
          }
        />
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
          <MapPin size={16} className="text-rose-500" /> Phù hợp với
        </h3>
        <input
          placeholder="VD: Gia đình, Cặp đôi..."
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          value={tour.best_for || ""}
          onChange={(event) =>
            onTourChange((prev) => ({ ...prev, best_for: event.target.value }))
          }
        />
      </div>
    </AdminFormCard>
  );
}
