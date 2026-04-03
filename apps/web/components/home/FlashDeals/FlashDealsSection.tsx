"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  MapPin,
  Users,
} from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { getFlashDeals } from "@/lib/flashDeals";
import { useCountdown } from "@/lib/useCountdown";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { formatDate, formatVND, normalizeImageSrc } from "@/lib/utils";
import { getTransportLabel } from "@/lib/tourDisplay";
import type { FlashDealItem } from "@/types/flash-deal";

function FlashDealCard({ item }: { item: FlashDealItem }) {
  const router = useRouter();
  const toast = useToast();
  const countdown = useCountdown(item.countdown_to);
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const countdownLabel = useMemo(() => {
    const d = String(countdown.days).padStart(2, "0");
    const h = String(countdown.hours).padStart(2, "0");
    const m = String(countdown.minutes).padStart(2, "0");
    const s = String(countdown.seconds).padStart(2, "0");

    if (countdown.days > 0) {
      return `${d} ngày ${h}:${m}:${s}`;
    }

    return `${h}:${m}:${s}`;
  }, [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]);

  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    "/placeholder-tour.jpg";
  const displayPrice = item.sale_price || item.original_price || 0;
  const hasDiscount =
    !!item.original_price && item.original_price > item.sale_price;

  const brandRed = "text-red-600";
  const brandRedBg = "bg-red-600";
  const brandRedBorder = "border-red-600";

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
    <article className="group w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px] lg:w-[310px]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <FavoriteButton
          active={isFavorite(item.tour_id)}
          loading={isPending(item.tour_id)}
          onClick={handleFavoriteClick}
          className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110 ${
            isFavorite(item.tour_id)
              ? "bg-rose-500 text-white"
              : "bg-black/20 text-white hover:bg-white/25"
          }`}
          iconClassName="h-5 w-5"
          label={
            isFavorite(item.tour_id)
              ? "Bỏ khỏi yêu thích"
              : "Thêm vào yêu thích"
          }
        />

        {item.discount_percent ? (
          <div className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
            -{item.discount_percent}%
          </div>
        ) : null}

        <div className="absolute inset-x-2 bottom-3 flex items-center gap-1.5">
          <div className="flex items-center justify-center gap-1 rounded-lg border border-sky-50 bg-white px-2 py-1.5 text-[12px] font-bold text-sky-600 shadow-md">
            <Clock className="h-3 w-3" />
            <span>Giờ chót</span>
          </div>

          <div className="w-9 shrink-0" />

          <div
            className={`flex-1 rounded-lg bg-white/80 py-1.5 text-center text-sm font-black ${brandRed} shadow-sm backdrop-blur-sm`}
          >
            {countdownLabel}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 h-[56px] text-[17px] font-bold leading-[1.6] text-slate-900 transition-colors group-hover:text-sky-600">
          {item.name}
        </h3>

        <div className="space-y-3 text-[14px] text-slate-700">
          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <Hash className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
            <span className="truncate font-medium uppercase">{item.code}</span>
          </div>

          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">
              Khởi hành:
            </span>
            <span className="truncate font-bold text-sky-600">
              {item.departure_name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Ngày:
              </span>
              <span className="truncate">{formatDate(item.start_date)}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-4">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{item.duration_text}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={item.transport_type}
                className="h-3.5 w-3.5 shrink-0 text-slate-500"
              />
              <span className="truncate">
                {item.transport_type
                  ? getTransportLabel(item.transport_type)
                  : "Cập nhật"}
              </span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-4">
              <Users className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-bold text-red-600">
                Còn {item.seats_left} chỗ
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
              <span
                className={`text-[12px] font-bold italic text-slate-400 ${hasDiscount ? "line-through" : ""}`}
              >
                {formatVND(item.original_price || 0)}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <p
                className={`text-[19px] font-black leading-none ${brandRed} tracking-tighter`}
              >
                {formatVND(displayPrice)}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center pl-2">
            <Link
              href={item.link}
              className={`flex h-[40px] items-center justify-center rounded-xl border-2 ${brandRedBorder} ${brandRed} bg-transparent px-4 text-center text-[12px] font-bold transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 active:scale-95`}
            >
              Đặt ngay
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FlashDealsSection() {
  const [items, setItems] = useState<FlashDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFlashDeals(20);

        if (!active) return;
        setItems(response.items);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Không tải được dữ liệu ưu đãi.",
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

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const timeout = window.setTimeout(() => {
      updateScrollState();
    }, 100);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timeout);
    };
  }, [items, loading]);

  const scrollSlider = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;

    const cardWidth = 326;
    const gap = 24;
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#eef8ff] px-4 py-4 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-4">
            <div className="relative inline-block">
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#0f5cab] sm:text-4xl">
                ƯU ĐÃI GIỜ CHÓT
              </h2>
              <span className="absolute -bottom-2 left-0 h-[4px] w-16 rounded-full bg-[#0f5cab]" />
            </div>

            <p className="max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
              Nhanh tay nắm bắt cơ hội giảm giá cuối cùng. Đặt ngay để không bỏ
              lỡ!
            </p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              disabled={!canScrollLeft}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition ${
                canScrollLeft
                  ? "text-slate-700 hover:-translate-y-0.5 hover:text-slate-900"
                  : "cursor-not-allowed text-slate-300"
              }`}
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={() => scrollSlider("right")}
              disabled={!canScrollRight}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition ${
                canScrollRight
                  ? "text-slate-700 hover:-translate-y-0.5 hover:text-slate-900"
                  : "cursor-not-allowed text-slate-300"
              }`}
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:w-[300px] lg:w-[310px]"
              >
                <div className="h-48 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-6 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="mt-4 h-12 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
            Hiện chưa có tour ưu đãi giờ chót.
          </div>
        ) : (
          <>
            <div
              ref={sliderRef}
              className="flash-deals-slider flex gap-6 overflow-x-auto scroll-smooth pb-3"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {items.map((item) => (
                <FlashDealCard key={item.schedule_id} item={item} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/tours?deal=flash"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0f5cab] px-8 text-lg font-bold text-[#0f5cab] transition hover:bg-[#0f5cab] hover:text-white"
              >
                Xem tất cả
              </Link>
            </div>

            <style jsx>{`
              .flash-deals-slider::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </>
        )}
      </div>
    </section>
  );
}
