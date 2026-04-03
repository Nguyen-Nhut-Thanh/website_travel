"use client";

import React from "react";
import { ArrowRight, Calendar, Heart, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/common/Toast";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { formatVND, normalizeImageSrc } from "@/lib/utils";
import type { FavoriteTourItem } from "@/types/account";

interface FavoritesProps {
  favorites: FavoriteTourItem[];
  loading: boolean;
  onRefresh?: () => void | Promise<void>;
}

export const FavoriteTours: React.FC<FavoritesProps> = ({
  favorites,
  loading,
  onRefresh,
}) => {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = React.useState(1);
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite, refreshFavoriteIds } =
    useFavoriteTours();
  const totalPages = Math.max(1, Math.ceil(favorites.length / pageSize));
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [favorites.length]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFavoriteClick = async (tourId: number, tourName: string) => {
    const result = await toggleFavorite(tourId);

    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        router.push(`/login?callbackUrl=${encodeURIComponent("/account")}`);
        return;
      }

      toast.error(result.message);
      return;
    }

    if (result.action === "removed") {
      toast.success(`Đã bỏ "${tourName}" khỏi danh sách yêu thích.`);
      await onRefresh?.();
      await refreshFavoriteIds();
      return;
    }

    toast.success(`Đã lưu "${tourName}" vào danh sách yêu thích.`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-[1.75rem] bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
          />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <Heart className="text-rose-300" size={32} />
        </div>
        <h4 className="mb-2 font-[family:var(--font-display)] text-lg font-semibold text-slate-950">
          Chưa có tour yêu thích
        </h4>
        <p className="mb-6 text-sm text-slate-500">
          Lưu lại những hành trình đang gây hứng thú để xem lại bất kỳ lúc nào.
        </p>
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800"
        >
          Xem các tour <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedFavorites.map((fav) => {
          const tour = fav.tours;
          const isHiddenTour = tour.status !== 1;
          const coverImage =
            normalizeImageSrc(tour.tour_images?.[0]?.image_url) ||
            "/placeholder-tour.jpg";
          const nextSchedule = tour.tour_schedules?.[0];
          const active = isFavorite(tour.tour_id);

          return (
            <div
              key={fav.tour_id}
              className={`group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition-all ${
                isHiddenTour
                  ? "opacity-90"
                  : "hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(37,99,235,0.10)]"
              }`}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={coverImage}
                  alt={tour.name}
                  className={`h-full w-full object-cover transition-transform duration-700 ${
                    isHiddenTour ? "grayscale-[0.2]" : "group-hover:scale-105"
                  }`}
                />
                {isHiddenTour && (
                  <div className="absolute inset-0 bg-slate-950/28" />
                )}
                <div className="absolute right-4 top-4">
                  <FavoriteButton
                    active={active}
                    loading={isPending(tour.tour_id)}
                    onClick={() => handleFavoriteClick(tour.tour_id, tour.name)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all ${
                      active
                        ? "bg-rose-500 text-white"
                        : "bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white"
                    }`}
                    iconClassName="h-5 w-5"
                  />
                </div>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  <div className="rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
                    {tour.tour_type === "domestic" ? "Trong nước" : "Quốc tế"}
                  </div>
                  {isHiddenTour && (
                    <div className="rounded-full bg-amber-500/95 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
                      Ngừng kinh doanh
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h4 className="min-h-[3.2rem] line-clamp-2 font-[family:var(--font-display)] text-lg font-semibold text-slate-950 transition-colors group-hover:text-blue-700">
                  {tour.name}
                </h4>

                {isHiddenTour && (
                  <p className="mt-2 text-sm font-medium text-amber-700">
                    Tour hiện không mở bán và không thể xem chi tiết.
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} className="text-blue-500" />
                    <span>
                      {tour.duration_days} ngày {tour.duration_nights} đêm
                    </span>
                  </div>
                  {nextSchedule && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} className="text-blue-500" />
                      <span>
                        Khởi hành:{" "}
                        {new Date(nextSchedule.start_date).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Giá từ
                    </p>
                    <p className="text-xl font-semibold text-blue-700">
                      {formatVND(tour.base_price)}
                    </p>
                  </div>
                  {isHiddenTour ? (
                    <span
                      className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300"
                      aria-label="Tour đang tạm ẩn"
                      title="Tour đang tạm ẩn"
                    >
                      <ArrowRight size={20} />
                    </span>
                  ) : (
                    <Link
                      href={`/tours/${tour.tour_id}`}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-200 hover:bg-blue-600 hover:text-white"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 text-sm shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:flex-row">
          <p className="text-slate-500">
            Trang {currentPage}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
