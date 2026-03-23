"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { fetchHybridRecommendations } from "@/lib/ai";
import { API_BASE, fetchMe, getToken } from "@/lib/auth";
import { trackRecommendationEvent } from "@/lib/recommendationTracker";
import type {
  HybridRecommendationResponse,
  RecommendationProfile,
  RecommendationTourItem,
  UserProfile,
} from "@/types/account";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDuration(days: number, nights: number) {
  if (!days && !nights) return "Lịch linh hoạt";
  return `${days} ngày ${nights} đêm`;
}

export default function HomeAIRecommendationsSection() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<RecommendationProfile | null>(null);
  const [data, setData] = useState<HybridRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const me = await fetchMe();
        if (!active || !me?.user_id) return;
        setUser(me as UserProfile);

        const profileRes = await fetch(`${API_BASE}/recommendation-profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (active && profileRes.ok) {
          setProfile((await profileRes.json()) as RecommendationProfile);
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

  const recommendations = data?.recommendations ?? [];

  const handleRecommendationClick = (tour: RecommendationTourItem, index: number) => {
    void trackRecommendationEvent({
      event_type: "recommendation_click",
      source: "home_ai",
      tour_id: tour.tour_id,
      destination: tour.destination || undefined,
      metadata: {
        strategy: data?.strategy || "hybrid_content_knowledge",
        position: index + 1,
        score: tour.score_breakdown.final_score,
        personalized: Boolean(user?.user_id),
      },
    });
  };

  return (
    <section className="bg-[linear-gradient(180deg,#e8f6ff_0%,#dff1ff_52%,#eef8ff_100%)] px-4 py-8 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-[1440px] text-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
              <Sparkles size={14} />
              Gợi ý AI
            </div>
            <h2 className="mt-4 font-[family:var(--font-display)] text-3xl font-semibold leading-tight text-[#0f4c81] sm:text-4xl">
              {user?.user_id
                ? "Hệ thống đang chọn tour hợp gu và hành vi gần đây của bạn."
                : "Một loạt tour đang được AI đẩy lên theo mùa, giá và độ phù hợp hiện tại."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {user?.user_id
                ? "Ưu tiên thêm ngân sách, kiểu chuyến đi và tín hiệu xem tour để xếp hạng. Bạn sẽ thấy danh sách này thay đổi dần khi dùng hệ thống."
                : "Đăng nhập và cập nhật gu du lịch trong tài khoản để phần này chuyển sang bản cá nhân hóa sâu hơn."}
            </p>
          </div>

          <Link
            href={user?.user_id ? "/account?tab=preferences" : "/login?callbackUrl=%2Faccount"}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Star size={16} />
            {user?.user_id ? "Tinh chỉnh gu du lịch" : "Đăng nhập để cá nhân hóa"}
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <div
              className="flex gap-4 overflow-x-auto pb-3"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[280px] flex-shrink-0 rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:w-[300px]"
                >
                  <div className="h-4 w-24 rounded-full bg-sky-100" />
                  <div className="mt-4 h-7 w-5/6 rounded-full bg-slate-100" />
                  <div className="mt-3 h-4 w-3/5 rounded-full bg-slate-100" />
                  <div className="mt-6 h-10 rounded-2xl bg-slate-100" />
                  <div className="mt-3 h-10 rounded-2xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-sky-100 bg-white/80 px-5 py-6 text-sm text-slate-600 shadow-sm">
              Hệ gợi ý chưa có đủ tín hiệu để đẩy ra danh sách ổn định lúc này.
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm font-medium text-slate-600">
                Hiển thị {recommendations.length} tour gợi ý. Kéo ngang để xem thêm.
              </p>
              <div
                className="flex gap-4 overflow-x-auto pb-3"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
              {recommendations.map((tour, index) => (
                <Link
                  key={tour.tour_id}
                  href={`/tours/${tour.tour_id}`}
                  onClick={() => handleRecommendationClick(tour, index)}
                  className="group w-[280px] flex-shrink-0 rounded-[1.75rem] border border-white/90 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_24px_60px_rgba(14,116,144,0.14)] sm:w-[300px]"
                >
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-600">
                      {tour.destination || "Tour đang nổi bật"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] text-xl font-semibold leading-7 text-slate-900">
                      {tour.name}
                    </h3>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-sky-600" />
                      <span className="font-semibold text-[#0f5cab]">{formatCurrency(tour.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} className="text-sky-600" />
                      <span>{formatDuration(tour.duration_days, tour.duration_nights)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-sky-600" />
                      <span className="truncate">
                        {tour.departure_location || "Linh hoạt"}{tour.destination ? ` -> ${tour.destination}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {tour.reasons.slice(0, 3).map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-800">
                    <span>{tour.code || `Tour #${tour.tour_id}`}</span>
                    <span className="inline-flex items-center gap-1 text-sky-700 transition group-hover:text-sky-800">
                      Xem chi tiết
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
              </div>

              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
