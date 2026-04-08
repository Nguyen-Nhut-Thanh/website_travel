"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Hash, Hotel } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { getFeaturedTours } from "@/lib/featuredTours";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { getTransportLabel } from "@/lib/tourDisplay";
import { formatDate, formatVND, normalizeImageSrc } from "@/lib/utils";
import type { FeaturedTourItem } from "@/types/featured-tour";

function FeaturedTourCard({ item }: { item: FeaturedTourItem }) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    "/placeholder-tour.jpg";

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(item.tour_id);

    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
        return;
      }

      toast.error(result.message);
      return;
    }

    toast.success(
      result.action === "added"
        ? `Đã thêm "${item.name}" vào tour yêu thích.`
        : `Đã bỏ "${item.name}" khỏi tour yêu thích.`,
    );
  };

  return (
    <Link
      href={item.link}
      className="group block h-[250px] w-full bg-transparent [perspective:1200px]"
    >
      <div className="relative h-full w-full rounded-[18px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[18px] border border-white/70 bg-white p-5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.10)] [backface-visibility:hidden]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-[15px] font-extrabold uppercase tracking-tight text-slate-900">
              {item.route_text}
            </h3>

            <FavoriteButton
              active={isFavorite(item.tour_id)}
              loading={isPending(item.tour_id)}
              onClick={handleFavoriteClick}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors ${
                isFavorite(item.tour_id)
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500"
              }`}
              iconClassName="h-4.5 w-4.5"
              label={
                isFavorite(item.tour_id)
                  ? "Bỏ khỏi yêu thích"
                  : "Thêm vào yêu thích"
              }
            />
          </div>

          <div className="space-y-3 text-[14px] text-slate-700">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hash className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
              <span className="truncate">{item.code}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khởi hành:
              </span>
              <span className="truncate">{formatDate(item.start_date)}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hotel className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khách sạn:
              </span>
              <span className="truncate">{item.hotel_name || "Tiêu chuẩn"}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={item.transport_type}
                className="h-4 w-4 shrink-0 text-slate-400"
              />
              <span className="shrink-0 font-semibold text-slate-800">
                Phương tiện:
              </span>
              <span className="truncate">
                {item.transport_type
                  ? getTransportLabel(item.transport_type)
                  : "Đang cập nhật"}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 pt-3">
            <div className="ml-auto text-right">
              <p className="text-[13px] font-semibold text-slate-700">Giá từ</p>
              <p className="text-[16px] font-black text-red-600 sm:text-[18px]">
                {formatVND(item.price)}
                <span className="ml-1 text-slate-800">/ khách</span>
              </p>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/15" />

          <div className="absolute left-4 top-4 z-10">
            <FavoriteButton
              active={isFavorite(item.tour_id)}
              loading={isPending(item.tour_id)}
              onClick={handleFavoriteClick}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-colors ${
                isFavorite(item.tour_id)
                  ? "bg-rose-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              iconClassName="h-4.5 w-4.5"
              label={
                isFavorite(item.tour_id)
                  ? "Bỏ khỏi yêu thích"
                  : "Thêm vào yêu thích"
              }
            />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="w-full truncate px-2 text-sm font-extrabold text-white opacity-90">
              {item.name}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedToursSection() {
  const [items, setItems] = useState<FeaturedTourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFeaturedTours(8);

        if (!active) return;
        setItems(response.items);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được tour bán chạy.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#dff0ff] px-4 py-14 sm:px-6 lg:px-10 xl:px-16">
      <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 opacity-20">
        <svg viewBox="0 0 240 240" className="h-full w-full">
          <path
            d="M10 210C45 150 80 130 120 120C150 110 175 90 210 35"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <path
            d="M20 230C40 180 55 150 85 130"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[2px] text-red-500">
              Tour bán chạy
            </p>

            <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              Hành trình được yêu thích
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Khám phá những tour đang có nhu cầu cao nhất, được xếp hạng từ lịch khởi
              hành khả dụng kết hợp số lượt đặt và số khách đã đi.
            </p>
          </div>

          <Link
            href="/tours?collection=bestseller"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            Xem tất cả tour
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] overflow-hidden rounded-[18px] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.10)]"
              >
                <div className="h-full animate-pulse bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
            Hiện chưa có tour bán chạy.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <FeaturedTourCard key={item.schedule_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
