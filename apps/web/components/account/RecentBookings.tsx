"use client";

import React from "react";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Gift,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { formatVND, normalizeImageSrc } from "@/lib/utils";
import type { AccountBooking } from "@/types/account";

type BookingStatusMeta = {
  label: string;
  icon: LucideIcon;
  className: string;
};

interface BookingProps {
  bookings: AccountBooking[];
  loading: boolean;
  limit?: number;
}

const statusConfig: Record<string, BookingStatusMeta> = {
  pending: {
    label: "Chờ thanh toán",
    icon: Clock,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  paid: {
    label: "Đã thanh toán",
    icon: CreditCard,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: CheckCircle,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  completed: {
    label: "Hoàn thành",
    icon: Gift,
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export const RecentBookings: React.FC<BookingProps> = ({
  bookings,
  loading,
  limit,
}) => {
  const pageSize = 10;
  const isPaginated = !limit;
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(bookings.length / pageSize))
    : 1;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [bookings.length, limit]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const displayBookings = limit
    ? bookings.slice(0, limit)
    : bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[1.75rem] bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
          />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
          <Briefcase className="text-slate-300" size={32} />
        </div>
        <h4 className="mb-2 font-[family:var(--font-display)] text-lg font-semibold text-slate-950">
          Bạn chưa có đơn đặt tour nào
        </h4>
        <p className="mb-6 text-sm text-slate-500">
          Hãy khám phá các điểm đến nổi bật và đặt chỗ ngay khi sẵn sàng.
        </p>
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800"
        >
          Khám phá tour <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayBookings.map((booking) => {
        const schedule = booking.tour_schedules;
        const tour = schedule.tours;
        const status = statusConfig[booking.status] || statusConfig.pending;
        const coverImage =
          normalizeImageSrc(tour.tour_images?.[0]?.image_url) ||
          "/placeholder-tour.jpg";

        return (
          <div
            key={booking.booking_id}
            className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(37,99,235,0.10)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="h-28 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-24 md:w-28">
                <img
                  src={coverImage}
                  alt={tour.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-grow">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    #{booking.booking_id}
                  </span>
                  <div
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                  >
                    <status.icon size={12} />
                    {status.label}
                  </div>
                </div>
                <h4 className="line-clamp-1 font-[family:var(--font-display)] text-lg font-semibold text-slate-950 transition-colors group-hover:text-blue-700">
                  {tour.name}
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(schedule.start_date).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-blue-500" />
                    {booking.adult_count + booking.child_count + booking.infant_count}{" "}
                    khách
                  </span>
                </div>
              </div>

              <div className="flex w-full items-center justify-between border-t border-slate-100 pt-4 md:w-auto md:flex-col md:items-end md:justify-center md:border-t-0 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Tổng tiền
                  </p>
                  <p className="mt-1 text-xl font-semibold text-blue-700">
                    {formatVND(booking.total_amount)}
                  </p>
                </div>
                <Link
                  href={`/account/bookings/${booking.booking_id}`}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-600 hover:text-white md:mt-3 md:w-full"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {isPaginated && totalPages > 1 && (
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
