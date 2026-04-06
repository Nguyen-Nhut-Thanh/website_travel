"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { fetchHybridRecommendations } from "@/lib/ai";
import { fetchMe, getToken } from "@/lib/auth";
import { getRecommendationProfile } from "@/lib/authApi";
import { trackRecommendationEvent } from "@/lib/recommendationTracker";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { formatVND, normalizeImageSrc } from "@/lib/utils";
import type {
  HybridRecommendationResponse,
  RecommendationProfile,
  RecommendationTourItem,
  UserProfile,
} from "@/types/account";

function RecommendationCard({
  tour,
  index,
  strategy,
  personalized,
}: {
  tour: RecommendationTourItem;
  index: number;
  strategy: string;
  personalized: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(tour.tour_id);

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
        ? `Đã thêm "${tour.name}" vào tour yêu thích.`
        : `Đã bỏ "${tour.name}" khỏi tour yêu thích.`,
    );
  };

  const imageUrl = normalizeImageSrc(tour.image_url) || "/placeholder-tour.jpg";

  const displayReasons = tour.reasons
    .filter((r) => r !== "Còn chỗ khả dụng")
    .slice(0, 3);

  return (
    <article className="group w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px] lg:w-[310px]">
      <Link
        href={`/tours/${tour.tour_id}`}
        onClick={() => {
          void trackRecommendationEvent({
            event_type: "recommendation_click",
            source: "home_ai",
            tour_id: tour.tour_id,
            destination: tour.destination || undefined,
            metadata: {
              strategy,
              position: index + 1,
              score: tour.score_breakdown.final_score,
              personalized,
            },
          });
        }}
      >
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

          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <div className="rounded-full bg-sky-600/90 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
              Đề xuất cho bạn
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex flex-wrap gap-1.5">
              {displayReasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <h3 className="line-clamp-2 h-[56px] text-[17px] font-bold leading-[1.6] text-slate-900 transition-colors group-hover:text-sky-600">
            {tour.name}
          </h3>

          <div className="space-y-3 text-[14px] text-slate-700">
            <div className="flex items-start gap-x-2">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                  Lộ trình:
                </span>
                <span className="line-clamp-1 font-bold text-sky-700">
                  {tour.departure_location || "Linh hoạt"}
                  {tour.destination ? ` → ${tour.destination}` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="font-semibold text-slate-800">Thời lượng:</span>
              <span className="truncate">
                {tour.duration_days} ngày {tour.duration_nights} đêm
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500">
                Giá từ:
              </span>
              <p className="text-[19px] font-black leading-none text-sky-600 tracking-tighter">
                {formatVND(tour.price)}
              </p>
            </div>

            <div className="flex h-[36px] items-center gap-1 text-[13px] font-bold text-sky-700 transition group-hover:text-sky-800">
              Chi tiết
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function HomeAIRecommendationsSection() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<RecommendationProfile | null>(null);
  const [data, setData] = useState<HybridRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const me = await fetchMe();
        if (!active || !me?.user_id) return;
        setUser(me as UserProfile);

        const profileData = await getRecommendationProfile();
        if (active) {
          setProfile(profileData as RecommendationProfile);
        }
      } catch {
        if (active) {
          setUser(null);
          setProfile(null);
        }
      }
    };

    void loadContext();

    return () => {
      active = false;
    };
  }, []);

  const requestPayload = useMemo(
    () => ({
      user_id: user?.user_id,
      preferred_month: new Date().getMonth() + 1,
      group_type: profile?.preferred_group_type || undefined,
      travel_style: profile?.preferred_styles?.[0] || undefined,
      limit: 10,
    }),
    [profile, user?.user_id],
  );

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchHybridRecommendations(requestPayload);
        if (!active) return;
        setData(response);

        if (response.recommendations.length > 0) {
          void trackRecommendationEvent({
            event_type: "recommendation_impression",
            source: "home_ai",
            metadata: {
              strategy: response.strategy,
              total_candidates: response.total_candidates,
              shown_count: response.recommendations.length,
              personalized: Boolean(user?.user_id),
            },
          });
        }
      } catch (fetchError) {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Không thể tải gợi ý lúc này.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRecommendations();

    return () => {
      active = false;
    };
  }, [requestPayload, user?.user_id]);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updateScrollState();
    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const timeout = setTimeout(updateScrollState, 100);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [data, loading]);

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

  const recommendations = data?.recommendations ?? [];

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="relative inline-block">
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#0f5cab] sm:text-4xl">
                {user?.user_id ? "DÀNH RIÊNG CHO BẠN" : "GỢI Ý TOUR NỔI BẬT"}
              </h2>
              <span className="absolute -bottom-2 left-0 h-[4px] w-16 rounded-full bg-[#0f5cab]" />
            </div>

            <p className="max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
              {user?.user_id
                ? "Dựa trên sở thích và phong cách du lịch của bạn, chúng tôi đã chọn lọc những hành trình tuyệt vời nhất."
                : "Khám phá những điểm đến hấp dẫn được cộng đồng yêu thích nhất hiện nay."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={() => scrollSlider("left")}
                disabled={!canScrollLeft}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white shadow-sm transition ${
                  canScrollLeft
                    ? "text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600 hover:shadow-md"
                    : "cursor-not-allowed text-slate-300"
                }`}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => scrollSlider("right")}
                disabled={!canScrollRight}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-white shadow-sm transition ${
                  canScrollRight
                    ? "text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600 hover:shadow-md"
                    : "cursor-not-allowed text-slate-300"
                }`}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <Link
              href={
                user?.user_id
                  ? "/account?tab=preferences"
                  : "/login?callbackUrl=%2Faccount"
              }
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-sky-50 px-5 text-sm font-bold text-sky-700 transition hover:bg-sky-100 active:scale-95"
            >
              <Star size={16} fill="currentColor" />
              <span className="hidden sm:inline">
                {user?.user_id ? "Cập nhật gu du lịch" : "Cá nhân hóa ngay"}
              </span>
              <span className="sm:hidden">Gu du lịch</span>
            </Link>
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
                  <div className="mt-4 h-12 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-8 text-center text-slate-600 shadow-sm">
            Hệ gợi ý chưa có đủ tín hiệu để đẩy ra danh sách lúc này.
          </div>
        ) : (
          <div className="relative">
            <div
              ref={sliderRef}
              className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-8 pt-2"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {recommendations.map((tour, index) => (
                <RecommendationCard
                  key={tour.tour_id}
                  tour={tour}
                  index={index}
                  strategy={data?.strategy || "hybrid"}
                  personalized={Boolean(user?.user_id)}
                />
              ))}
            </div>

            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        )}
      </div>
    </section>
  );
}
