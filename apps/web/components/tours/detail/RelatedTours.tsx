"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Hash,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { getPublicTours } from "@/lib/publicFetch";
import { getTransportLabel } from "@/lib/tourDisplay";
import { formatDate, formatVND, normalizeImageSrc } from "@/lib/utils";
import type { PublicTourCard, PublicToursResponse } from "@/types/tour";

type Props = {
  currentTourId?: number;
};

function RelatedTourCard({ tour }: { tour: PublicTourCard }) {
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();
  const imageUrl = normalizeImageSrc(tour.cover_image) || "/placeholder-tour.jpg";
  const schedule = tour.next_schedule;
  const seatsLeft = schedule
    ? Math.max(0, (schedule.quota || 0) - (schedule.booked_count || 0))
    : null;

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(tour.tour_id);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(
      result.action === "added"
        ? `Đã thêm "${tour.name}" vào tour yêu thích.`
        : `Đã bỏ "${tour.name}" khỏi tour yêu thích.`,
    );
  };

  return (
    <article className="group w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px] lg:w-[310px]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={tour.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <FavoriteButton
          active={isFavorite(tour.tour_id)}
          loading={isPending(tour.tour_id)}
          onClick={handleFavoriteClick}
          className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110 ${
            isFavorite(tour.tour_id)
              ? "bg-rose-500 text-white"
              : "bg-black/20 text-white hover:bg-white/25"
          }`}
          iconClassName="h-5 w-5"
        />

        <div className="absolute inset-x-3 bottom-3 flex items-center">
          <div className="flex items-center gap-1 rounded-lg border border-sky-50 bg-white px-2 py-1.5 text-[12px] font-bold text-sky-600 shadow-md">
            <Sparkles className="h-3 w-3" />
            <span>Gợi ý cho bạn</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 h-[56px] text-[17px] font-bold leading-[1.6] text-slate-900 transition-colors group-hover:text-sky-600">
          {tour.name}
        </h3>

        <div className="space-y-3 text-[14px] text-slate-700">
          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <Hash className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
            <span className="truncate font-medium uppercase">{tour.code}</span>
          </div>

          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">
              Khởi hành:
            </span>
            <span className="truncate font-bold text-sky-600">
              {tour.departure_location?.name || "Toàn quốc"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Ngày:
              </span>
              <span className="truncate">
                {schedule ? formatDate(schedule.start_date) : "Liên hệ"}
              </span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-4">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {tour.duration_days}N{tour.duration_nights}Đ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={tour.transport?.type}
                className="h-3.5 w-3.5 shrink-0 text-slate-500"
              />
              <span className="truncate">
                {tour.transport?.type
                  ? getTransportLabel(tour.transport.type)
                  : "Cập nhật"}
              </span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-4">
              <Users className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-bold text-red-600">
                {seatsLeft != null ? `Còn ${seatsLeft} chỗ` : "Còn chỗ"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-stretch gap-0 border-t border-slate-100 pt-4">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">
                Giá từ:
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <p className="text-[19px] font-black leading-none tracking-tighter text-red-600">
                {formatVND(tour.base_price)}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center pl-2">
            <Link
              href={`/tours/${tour.tour_id}`}
              className="flex h-[40px] items-center justify-center rounded-xl border-2 border-red-600 bg-transparent px-4 text-center text-[12px] font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 active:scale-95"
            >
              Đặt ngay
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RelatedTours({ currentTourId }: Props) {
  const [tours, setTours] = useState<PublicTourCard[]>([]);

  useEffect(() => {
    let active = true;

    const fetchTours = async () => {
      try {
        const data = await getPublicTours<PublicToursResponse>({ take: 8 });
        if (!active) return;

        const filtered = (data.items || [])
          .filter((tour) => tour.tour_id !== currentTourId)
          .slice(0, 4);

        setTours(filtered);
      } catch {
        if (active) {
          setTours([]);
        }
      }
    };

    fetchTours();

    return () => {
      active = false;
    };
  }, [currentTourId]);

  const hasTours = useMemo(() => tours.length > 0, [tours]);

  if (!hasTours) return null;

  return (
    <section className="bg-[#eef8ff] px-4 py-12 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 space-y-4">
          <div className="relative inline-block">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#0f5cab] sm:text-4xl">
              TOUR GỢI Ý KHÁC
            </h2>
            <span className="absolute -bottom-2 left-0 h-[4px] w-16 rounded-full bg-[#0f5cab]" />
          </div>

          <p className="max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
            Một vài hành trình khác có thể phù hợp với lịch trình và sở thích của bạn.
          </p>
        </div>

        <div
          className="flex gap-6 overflow-x-auto pb-3"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {tours.map((tour) => (
            <RelatedTourCard key={tour.tour_id} tour={tour} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/tours"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0f5cab] px-8 text-lg font-bold text-[#0f5cab] transition hover:bg-[#0f5cab] hover:text-white"
          >
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
}
