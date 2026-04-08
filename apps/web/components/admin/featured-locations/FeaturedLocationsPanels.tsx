"use client";

import {
  AlertCircle,
  Check,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  MapPin,
  Star,
  Trash2,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { FEATURED_LIMIT } from "@/lib/admin/featuredLocations";
import type { AdminLocationItem } from "@/types/admin-location";

function VisualGrid({ items }: { items: AdminLocationItem[] }) {
  const getGridClass = (index: number) => {
    const layouts = [
      "col-span-3 row-span-2",
      "col-span-2 row-span-1",
      "col-span-4 row-span-1",
      "col-span-2 row-span-1",
      "col-span-2 row-span-1",
      "col-span-2 row-span-2",
      "col-span-2 row-span-1",
      "col-span-3 row-span-1",
      "col-span-2 row-span-1",
    ];
    return layouts[index] || "";
  };

  return (
    <div className="aspect-[16/10] w-full rounded-xl border border-slate-200 bg-slate-100 p-2 shadow-inner">
      <div className="grid h-full grid-cols-9 grid-rows-3 gap-1.5">
        {Array.from({ length: FEATURED_LIMIT }).map((_, index) => {
          const item = items[index];
          return (
            <div
              key={index}
              className={`${getGridClass(index)} flex items-center justify-center overflow-hidden rounded-md border transition-all duration-500 ${
                item ? "border-blue-400 bg-blue-600 shadow-sm" : "border-dashed border-slate-200 bg-white opacity-40"
              }`}
            >
              {item ? (
                <div className="relative h-full w-full">
                  {item.featured_image ? (
                    <ImageWithFallback
                      src={item.featured_image}
                      className="h-full w-full object-cover opacity-60"
                      alt={item.name}
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-600" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="truncate px-1 text-[10px] font-black text-white drop-shadow-md">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-300">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FeaturedLocationsLeftPanel({
  allChildren,
  featured,
  onToggleSelect,
}: {
  allChildren: AdminLocationItem[];
  featured: AdminLocationItem[];
  onToggleSelect: (location: AdminLocationItem) => void;
}) {
  return (
    <div className="space-y-6 lg:col-span-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
            <MapPin size={16} className="text-blue-500" />
            Địa điểm con
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {allChildren.length} mục
          </span>
        </div>

        <div className="custom-scrollbar max-h-[550px] space-y-2 overflow-y-auto p-4">
          {allChildren.length === 0 ? (
            <div className="py-10 text-center text-xs italic text-slate-300">
              Không có địa điểm con nào thuộc vùng này
            </div>
          ) : (
            allChildren.map((location) => {
              const isSelected = featured.some((item) => item.location_id === location.location_id);

              return (
                <div
                  key={location.location_id}
                  onClick={() => onToggleSelect(location)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    isSelected ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {isSelected ? <Check size={16} /> : <MapPin size={16} />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                        {location.name}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                        {location.geographic_levels?.name || "Không rõ cấp độ"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-900">
          <LayoutGrid size={14} className="text-blue-500" />
          Mô phỏng vị trí (9 ô)
        </h3>
        <VisualGrid items={featured} />
        <p className="mt-4 text-center text-[9px] font-medium italic text-slate-400">
          * Vị trí 1 và 6 hiển thị kích thước lớn trên trang chủ.
        </p>
      </div>
    </div>
  );
}

export function FeaturedLocationsRightPanel({
  featured,
  onMoveItem,
  onToggleSelect,
  onImageChange,
}: {
  featured: AdminLocationItem[];
  onMoveItem: (index: number, direction: "up" | "down") => void;
  onToggleSelect: (location: AdminLocationItem) => void;
  onImageChange: (index: number, value: string | null) => void;
}) {
  return (
    <div className="space-y-4 lg:col-span-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            Thứ tự hiển thị ({featured.length}/9)
          </h3>
        </div>

        <div className="custom-scrollbar max-h-[750px] space-y-4 overflow-y-auto p-6">
          {featured.length === 0 ? (
            <div className="space-y-3 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 py-20 text-center">
              <Star className="mx-auto text-slate-200" size={40} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Chọn địa điểm từ bên trái để bắt đầu
              </p>
            </div>
          ) : (
            featured.map((location, index) => {
              const hasNoImage =
                !location.featured_image &&
                (!location.location_images || location.location_images.length === 0);

              return (
                <div
                  key={location.location_id}
                  className="group rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-4 transition-all hover:shadow-md"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center gap-1 rounded-xl bg-slate-50 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onMoveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 text-slate-300 transition-all hover:text-blue-500 disabled:opacity-0"
                      >
                        <GripVertical size={16} />
                      </button>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => onMoveItem(index, "down")}
                        disabled={index === featured.length - 1}
                        className="p-1 text-slate-300 transition-all hover:text-blue-500 disabled:opacity-0"
                      >
                        <GripVertical size={16} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900">{location.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                index === 0 || index === 5
                                  ? "border-amber-100 bg-amber-50 text-amber-600"
                                  : "border-slate-100 bg-slate-50 text-slate-500"
                              }`}
                            >
                              {index === 0 || index === 5 ? "Ô lớn" : "Ô tiêu chuẩn"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleSelect(location)}
                          className="rounded-xl p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="border-t border-slate-50 pt-3">
                        <div className="flex flex-col gap-6 md:flex-row">
                          <div className="w-full shrink-0 md:w-32">
                            <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Ảnh mặc định
                            </label>
                            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                              {location.location_images?.[0]?.image_url ? (
                                <ImageWithFallback
                                  src={location.location_images[0].image_url}
                                  className="h-full w-full object-cover"
                                  alt={location.name}
                                />
                              ) : (
                                <ImageIcon size={16} className="text-slate-200" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <ImageIcon size={14} className="text-blue-400" />
                              Ảnh hiển thị riêng (Ghi đè)
                            </label>
                            <ImageUpload
                              value={location.featured_image ? [location.featured_image] : []}
                              endpoint="/admin/locations/upload"
                              onChange={(urls) =>
                                onImageChange(
                                  index,
                                  Array.isArray(urls) ? urls[0] || null : urls || null,
                                )
                              }
                              label="Chỉ upload nếu muốn dùng ảnh khác ảnh mặc định"
                            />
                            {hasNoImage && (
                              <p className="flex items-center gap-1 text-[10px] font-bold italic text-rose-500">
                                <AlertCircle size={10} />
                                Địa điểm này chưa có hình ảnh mặc định.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
