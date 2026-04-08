"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock3, MapPin, Ticket, Users } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { useToast } from "@/components/common/Toast";

type Props = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

function formatScheduleDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function TourBookingSidebar({
  tour,
  selectedSchedule = null,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();
  const displayPrice = Number(selectedSchedule?.price ?? tour.base_price);
  const remainingSeats = selectedSchedule
    ? Math.max(
        Number(selectedSchedule.quota || 0) -
          Number(selectedSchedule.booked_count || 0),
        0,
      )
    : null;
  const bookingHref = selectedSchedule
    ? `/booking?tourId=${tour.tour_id}&scheduleId=${selectedSchedule.tour_schedule_id}`
    : null;

  const scrollToSchedules = () => {
    const element = document.getElementById("tour-schedules");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFavoriteClick = async () => {
    const result = await toggleFavorite(tour.tour_id);

    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      toast.error(result.message);
      return;
    }

    toast.success(
      result.action === "added"
        ? `Đã lưu "${tour.name}" vào yêu thích.`
        : `Đã bỏ "${tour.name}" khỏi yêu thích.`,
    );
  };

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Giá từ
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <span className="font-[family:var(--font-display)] text-[34px] font-semibold leading-none text-[#ef3b2d]">
            {formatVND(displayPrice)}
          </span>
          <span className="pb-1 text-sm text-slate-500">/ khách</span>
        </div>

        {selectedSchedule ? (
          <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Ticket size={14} className="text-blue-500" />
                <span>
                  Mã chương trình:{" "}
                  <span className="font-semibold text-slate-900">
                    #{selectedSchedule.tour_schedule_id}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={14} className="text-blue-500" />
                <span>
                  Khởi hành:{" "}
                  <span className="font-semibold text-slate-900">
                    {tour.departure_locations?.name || "Đang cập nhật"}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={14} className="text-blue-500" />
                <span>
                  Ngày khởi hành:{" "}
                  <span className="font-semibold text-slate-900">
                    {formatScheduleDate(selectedSchedule.start_date)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock3 size={14} className="text-blue-500" />
                <span>
                  Thời gian:{" "}
                  <span className="font-semibold text-slate-900">
                    {tour.duration_days} ngày {tour.duration_nights} đêm
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={14} className="text-blue-500" />
                <span>
                  Số chỗ còn lại:{" "}
                  <span className="font-semibold text-slate-900">
                    {remainingSeats} chỗ
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={scrollToSchedules}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            <Calendar size={14} className="text-blue-500" />
            Chọn ngày khởi hành để xem chi tiết
          </button>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
          <FavoriteButton
            active={isFavorite(tour.tour_id)}
            loading={isPending(tour.tour_id)}
            onClick={handleFavoriteClick}
            label={
              isFavorite(tour.tour_id)
                ? "Đã lưu vào yêu thích"
                : "Lưu tour yêu thích"
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all ${
              isFavorite(tour.tour_id)
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-600 hover:text-white"
            }`}
            iconClassName="h-5 w-5"
          />

          {bookingHref ? (
            <Link
              href={bookingHref}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#0b63b6] px-5 text-sm font-semibold text-white transition-all hover:bg-[#09559c]"
            >
              Đặt tour
            </Link>
          ) : (
            <button
              type="button"
              onClick={scrollToSchedules}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#0b63b6] px-5 text-sm font-semibold text-white transition-all hover:bg-[#09559c]"
            >
              Chọn ngày khởi hành
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
