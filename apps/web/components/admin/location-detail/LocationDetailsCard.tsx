"use client";

import { Edit3, Globe, Lock, Star, CheckCircle2 } from "lucide-react";
import type { AdminLocationItem } from "@/types/admin-location";
import { type LocationDetailForm } from "@/lib/admin/locationDetail";

type Props = {
  form: LocationDetailForm;
  isNew: boolean;
  level3Id: string;
  level3List: AdminLocationItem[];
  onFormChange: (
    updater: (prev: LocationDetailForm) => LocationDetailForm,
  ) => void;
};

export function LocationDetailsCard({
  form,
  isNew,
  level3Id,
  level3List,
  onFormChange,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
          <Edit3 size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Chi tiết địa điểm</h3>
      </div>
      <div className="space-y-8 p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tên địa điểm chính thức
            </label>
            <input
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
              value={form.name}
              onChange={(event) =>
                onFormChange((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="VD: Vịnh Hạ Long, Paris, Tokyo..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Slug (URL) <Lock size={10} className="text-slate-400" />
            </label>
            <div className="relative">
              <input
                readOnly
                className="w-full cursor-not-allowed rounded-2xl border border-slate-100 bg-slate-100 px-5 py-4 text-sm font-medium text-slate-500 shadow-inner outline-none"
                value={form.slug}
                placeholder="tu-dong-theo-ten"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Lock size={14} className="text-slate-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {form.level_id === 3 ? (
            <div className="animate-in fade-in space-y-2 duration-300">
              <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Mã quốc gia (ISO){" "}
                {!isNew && <Lock size={10} className="text-slate-400" />}
              </label>
              <div className="relative">
                <input
                  readOnly={!isNew}
                  className={`w-full rounded-2xl border border-slate-100 px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all ${
                    !isNew
                      ? "cursor-not-allowed bg-slate-100 text-slate-500"
                      : "bg-slate-50 focus:border-blue-500 focus:bg-white"
                  }`}
                  value={form.country_code}
                  onChange={(event) =>
                    onFormChange((prev) => ({
                      ...prev,
                      country_code: event.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={10}
                  placeholder="VD: VN, JP, US..."
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!isNew ? (
                    <Lock size={14} className="text-slate-300" />
                  ) : (
                    <Globe size={16} className="text-slate-300" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in space-y-2 duration-300">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ghi chú / Mô tả ngắn
              </label>
              <input
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium shadow-sm outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                value={form.note}
                onChange={(event) =>
                  onFormChange((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
                placeholder="Thông tin thêm về địa điểm này..."
              />
            </div>
          )}

          {form.level_id === 3 ? (
            <div className="animate-in fade-in space-y-2 duration-300">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ghi chú / Mô tả ngắn
              </label>
              <input
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium shadow-sm outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                value={form.note}
                onChange={(event) =>
                  onFormChange((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
                placeholder="Thông tin thêm về địa điểm này..."
              />
            </div>
          ) : (
            <div className="animate-in fade-in flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 duration-300">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-blue-500 shadow-sm">
                  <Globe size={16} />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Thuộc quốc gia
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {level3List.find(
                      (country) => String(country.location_id) === level3Id,
                    )?.name || "Chưa xác định"}{" "}
                    <span className="ml-1 text-blue-500">
                      ({form.country_code})
                    </span>
                  </span>
                </div>
              </div>
              <Lock size={14} className="text-slate-300" />
            </div>
          )}
        </div>

        <div className="border-t border-slate-50 pt-8">
          <div className="flex flex-wrap gap-4">
            <div
              className={`flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-3xl border-2 p-6 transition-all ${
                form.is_featured
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-50 bg-slate-50 hover:border-slate-100"
              }`}
              onClick={() =>
                onFormChange((prev) => ({
                  ...prev,
                  is_featured: !prev.is_featured,
                }))
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-2xl p-3 ${
                    form.is_featured
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "border border-slate-100 bg-white text-slate-400"
                  }`}
                >
                  <Star
                    size={20}
                    fill={form.is_featured ? "currentColor" : "none"}
                  />
                </div>
                <div>
                  <span
                    className={`block text-sm font-black ${form.is_featured ? "text-blue-900" : "text-slate-900"}`}
                  >
                    Địa điểm nổi bật
                  </span>
                  <p
                    className={`text-[10px] font-bold ${form.is_featured ? "text-blue-600" : "text-slate-400"}`}
                  >
                    Sẽ hiển thị ưu tiên tại trang chủ
                  </p>
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  form.is_featured
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                {form.is_featured && <CheckCircle2 size={12} />}
              </div>
            </div>

            {form.is_featured && (
              <div className="animate-in zoom-in-95 w-full rounded-3xl border border-blue-100 bg-blue-50 p-6 md:w-48">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Thứ tự hiển thị
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-center font-black text-blue-900 outline-none"
                  value={form.featured_order || ""}
                  onChange={(event) =>
                    onFormChange((prev) => ({
                      ...prev,
                      featured_order: event.target.value
                        ? Number(event.target.value)
                        : null,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
