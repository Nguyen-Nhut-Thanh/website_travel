"use client";

import { ChevronRight, EyeOff } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";

type Tour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  base_price: string | number;
  status: number;
};

type Props = {
  loading: boolean;
  tours: Tour[];
  selectedTourId: number | null;
  searchTerm: string;
  tourStatusFilter: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSelectTour: (tourId: number) => void;
  onPageChange: (page: number) => void;
};

function TourListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 rounded-2xl border border-slate-100 bg-white px-4 py-3"
        >
          <div className="h-3 w-14 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function TourListPanel({
  loading,
  tours,
  selectedTourId,
  searchTerm,
  tourStatusFilter,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onSearchChange,
  onFilterChange,
  onSelectTour,
  onPageChange,
}: Props) {
  return (
    <div className="sticky top-6 lg:col-span-4">
      <div className="flex h-[calc(100vh-180px)] min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="space-y-3 border-b border-slate-100 bg-slate-50/50 p-4">
          <AdminSearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Tìm tên hoặc mã tour..."
            roundedClassName="rounded-xl"
          />

          <div className="flex items-center gap-2">
            {[
              {
                id: "all",
                label: "Tất cả",
                activeClass: "bg-slate-900 text-white border-slate-900",
              },
              {
                id: "active",
                label: "Hoạt động",
                activeClass: "bg-emerald-600 text-white border-emerald-600",
              },
              {
                id: "hidden",
                label: "Đang ẩn",
                activeClass: "bg-rose-600 text-white border-rose-600",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  tourStatusFilter === item.id
                    ? item.activeClass
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto">
          {loading ? (
            <TourListSkeleton />
          ) : tours.length === 0 ? (
            <div className="p-10 text-center text-sm font-medium text-slate-400">
              Không có tour nào
            </div>
          ) : (
            tours.map((tour) => (
              <button
                key={tour.tour_id}
                onClick={() => onSelectTour(tour.tour_id)}
                className={`group relative flex w-full items-center justify-between overflow-hidden border-b border-slate-50 px-5 py-4 text-left transition-all ${
                  selectedTourId === tour.tour_id
                    ? "border-l-4 border-l-blue-600 bg-blue-50/80 shadow-inner"
                    : "hover:z-10 hover:bg-slate-50 hover:shadow-md"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                <div className="relative z-10 space-y-1.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-medium transition-all duration-300 ${
                        selectedTourId === tour.tour_id
                          ? "scale-105 border-blue-600 bg-white text-blue-600"
                          : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-300 group-hover:text-blue-500"
                      }`}
                    >
                      {tour.code}
                    </span>
                    <span
                      className={`truncate text-[12px] font-bold leading-tight transition-colors duration-300 ${
                        selectedTourId === tour.tour_id
                          ? "text-blue-700"
                          : "text-slate-900 group-hover:text-blue-600"
                      }`}
                    >
                      {tour.name}
                    </span>
                    {tour.status === 0 && (
                      <span title="Tour gốc đang ẩn">
                        <EyeOff
                          size={12}
                          className="flex-shrink-0 text-rose-500"
                        />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs font-medium text-slate-400">
                      {tour.duration_days} ngày
                    </p>
                    <span className="h-1 w-1 rounded-full bg-slate-200 transition-colors group-hover:bg-blue-200" />
                    <p
                      className={`text-sm font-medium transition-all duration-300 ${
                        selectedTourId === tour.tour_id
                          ? "text-blue-600"
                          : "text-slate-600 group-hover:text-blue-500"
                      }`}
                    >
                      {Number(tour.base_price).toLocaleString()}đ
                    </p>
                    {tour.status === 0 && (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-500">
                        Đang ẩn
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex-shrink-0 transition-all duration-300 ${
                    selectedTourId === tour.tour_id
                      ? "translate-x-0 opacity-100"
                      : "translate-x-4 opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                  }`}
                >
                  <ChevronRight
                    size={16}
                    className={
                      selectedTourId === tour.tour_id
                        ? "text-blue-600"
                        : "text-blue-400"
                    }
                  />
                </div>
              </button>
            ))
          )}
        </div>

        {!loading && tours.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="tour"
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
