"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Ticket } from "lucide-react";
import { formatVND } from "@/lib/utils";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { useToast } from "@/components/common/Toast";

type Props = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

export default function TourBookingSidebar({
  tour,
  selectedSchedule = null,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();
  const nearestSchedule = selectedSchedule ?? tour.tour_schedules?.[0] ?? null;
  const displayPrice = Number(nearestSchedule?.price ?? tour.base_price);
  const bookingHref = nearestSchedule
    ? `/booking?tourId=${tour.tour_id}&scheduleId=${nearestSchedule.tour_schedule_id}`
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.38)]">
        <p className="mb-2 text-sm font-semibold text-slate-700">Giá từ</p>

        <div className="flex flex-wrap items-end gap-1.5">
          <span className="text-[34px] font-extrabold leading-none text-[#ef3b2d]">
            {formatVND(displayPrice).replace(" đ", "").replace("₫", "")}
          </span>
          <span className="pb-1 text-base text-slate-500">/ Khách</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Ticket className="h-4 w-4 shrink-0" />
          <span>Mã chương trình:</span>
          <span className="break-all font-bold uppercase text-slate-700">
            {tour.code}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>Ngày khởi hành:</span>
          <span className="font-bold text-slate-700">
            {nearestSchedule
              ? new Date(nearestSchedule.start_date).toLocaleDateString("vi-VN")
              : "Chưa chọn lịch"}
          </span>
        </div>

        <div className="mt-6 flex items-stretch gap-3">
          <FavoriteButton
            active={isFavorite(tour.tour_id)}
            loading={isPending(tour.tour_id)}
            onClick={handleFavoriteClick}
            label={
              isFavorite(tour.tour_id)
                ? "Đã lưu vào yêu thích"
                : "Lưu tour yêu thích"
            }
            className={`flex w-[56px] shrink-0 items-center justify-center rounded-md border transition ${
              isFavorite(tour.tour_id)
                ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600"
            }`}
            iconClassName="h-5 w-5"
          />

          {bookingHref ? (
            <Link
              href={bookingHref}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0b63b6] px-4 py-3.5 text-base font-bold text-white transition hover:bg-[#09559c]"
            >
              <CalendarDays className="h-4 w-4" />
              Đặt tour ngay
            </Link>
          ) : (
            <button
              type="button"
              onClick={scrollToSchedules}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0b63b6] px-4 py-3.5 text-base font-bold text-white transition hover:bg-[#09559c]"
            >
              <CalendarDays className="h-4 w-4" />
              Chọn ngày khởi hành
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
