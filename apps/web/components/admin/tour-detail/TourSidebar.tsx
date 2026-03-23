"use client";

import { AlertTriangle, CheckCircle2, Clock, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PriceInput } from "@/components/admin/PriceInput";
import type { TourDetailForm } from "@/lib/admin/tourDetail";

type Props = {
  tour: TourDetailForm;
  saving: boolean;
  success: boolean;
  onSave: () => void;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export function TourSidebar({ tour, saving, success, onSave, onTourChange }: Props) {
  return (
    <div className="space-y-8">
      <AdminFormCard
        title="Hình ảnh quảng bá"
        titleClassName="text-sm uppercase tracking-wider"
        icon={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ImageIcon size={18} />
          </div>
        }
        bodyClassName="p-6"
      >
        <ImageUpload
          multiple
          maxFiles={5}
          label="Thêm ảnh tour"
          value={tour.images || []}
          onChange={(urls) => onTourChange((prev) => ({ ...prev, images: urls }))}
        />
      </AdminFormCard>

      <AdminFormCard bodyClassName="space-y-6 p-6">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
            <Clock size={16} /> Thời lượng hành trình
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Số ngày
              </span>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:bg-white"
                value={tour.duration_days === 0 ? "" : tour.duration_days}
                placeholder="1"
                onChange={(event) =>
                  onTourChange((prev) => ({
                    ...prev,
                    duration_days: Math.max(1, Number(event.target.value)),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Số đêm
              </span>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:bg-white"
                value={tour.duration_nights === 0 ? "" : tour.duration_nights}
                placeholder="0"
                onChange={(event) =>
                  onTourChange((prev) => ({
                    ...prev,
                    duration_nights: Math.max(0, Number(event.target.value)),
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-50 pt-6">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-600">
            <AlertTriangle size={16} /> Quản lý chốt khách
          </h3>
          <div className="space-y-1">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Chốt trước (giờ)
            </span>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-bold outline-none transition-all focus:border-rose-300 focus:bg-white"
                value={tour.cut_off_hours ?? ""}
                placeholder="24"
                onChange={(event) =>
                  onTourChange((prev) => ({
                    ...prev,
                    cut_off_hours: event.target.value === "" ? undefined : Number(event.target.value),
                  }))
                }
              />
            </div>
            <p className="ml-1 mt-1 text-[10px] italic text-slate-400">
              * Tour sẽ tự động ẩn trên website trước giờ khởi hành X tiếng.
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-50 pt-6">
          <PriceInput
            label="Giá cơ bản"
            value={tour.base_price ?? 0}
            onChange={(value) => onTourChange((prev) => ({ ...prev, base_price: value }))}
            placeholder="Ví dụ: 5.000.000"
          />
        </div>
      </AdminFormCard>

      <button
        onClick={onSave}
        disabled={saving}
        className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:opacity-50"
      >
        {saving ? <Loader2 size={20} className="animate-spin" /> : success ? <CheckCircle2 size={20} /> : <Save size={20} />}
        <span>{success ? "Đã lưu thành công" : "Lưu thay đổi ngay"}</span>
      </button>
    </div>
  );
}
