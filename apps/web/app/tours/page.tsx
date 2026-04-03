"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Hash,
  Clock,
  Hotel,
  Calendar,
} from "lucide-react";
import TransportIcon from "@/components/common/TransportIcon";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import { getPublicTours } from "@/lib/publicFetch";
import { trackRecommendationEvent } from "@/lib/recommendationTracker";
import { useFavoriteTours } from "@/lib/useFavoriteTours";
import { getTourPriceValue, getTransportLabel } from "@/lib/tourDisplay";
import { formatVND, getTodayString, normalizeImageSrc } from "@/lib/utils";
import type {
  PublicTourCard,
  PublicToursResponse,
  TourSchedule,
} from "@/types/tour";

type BudgetPreset = {
  label: string;
  min_price?: string;
  max_price?: string;
};

const BUDGET_PRESETS: BudgetPreset[] = [
  { label: "Dưới 5 triệu", max_price: "5000000" },
  { label: "Từ 5 - 10 triệu", min_price: "5000000", max_price: "10000000" },
  { label: "Từ 10 - 20 triệu", min_price: "10000000", max_price: "20000000" },
  { label: "Trên 20 triệu", min_price: "20000000" },
];

function getTourPrice(tour: PublicTourCard) {
  return getTourPriceValue(tour.base_price, tour.next_schedule?.price);
}

function ToursContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const [data, setData] = useState<PublicToursResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") ||
      searchParams.get("location") ||
      searchParams.get("country") ||
      "",
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || "",
  );
  const [collection, setCollection] = useState(
    searchParams.get("collection") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("collection") === "bestseller" ? "bestseller" : "nearest",
  );

  const query = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      destination:
        searchParams.get("destination") ||
        searchParams.get("location") ||
        searchParams.get("country") ||
        "",
      departure_location: searchParams.get("departure_location") || "",
      date_from: searchParams.get("date_from") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      collection: searchParams.get("collection") || "",
      deal: searchParams.get("deal") || "",
      take: "20",
      skip: "0",
    }),
    [searchParams],
  );

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
    setDestination(
      searchParams.get("destination") ||
        searchParams.get("location") ||
        searchParams.get("country") ||
        "",
    );
    setDateFrom(searchParams.get("date_from") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setCollection(searchParams.get("collection") || "");
    setSortBy(
      searchParams.get("collection") === "bestseller"
        ? "bestseller"
        : "nearest",
    );
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getPublicTours<PublicToursResponse>(query);
        if (!isMounted) return;
        setData(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const items = useMemo(() => {
    if (!data?.items) return [];

    const cloned = [...data.items];

    if (sortBy === "bestseller") {
      return cloned;
    }

    if (sortBy === "price-asc") {
      cloned.sort((a, b) => getTourPrice(a) - getTourPrice(b));
    } else if (sortBy === "price-desc") {
      cloned.sort((a, b) => getTourPrice(b) - getTourPrice(a));
    } else {
      cloned.sort((a, b) => {
        const aTime = a.next_schedule?.start_date
          ? new Date(a.next_schedule.start_date).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bTime = b.next_schedule?.start_date
          ? new Date(b.next_schedule.start_date).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      });
    }

    return cloned;
  }, [data, sortBy]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (keyword.trim()) params.set("search", keyword.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (collection) params.set("collection", collection);

    router.push(`/tours${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const selectBudgetPreset = (preset: BudgetPreset) => {
    setMinPrice(preset.min_price || "");
    setMaxPrice(preset.max_price || "");
  };

  const clearBudgetPreset = () => {
    setMinPrice("");
    setMaxPrice("");
  };

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    tourId: number,
    tourName: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(tourId);

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
        ? `Đã lưu "${tourName}" vào yêu thích.`
        : `Đã bỏ "${tourName}" khỏi yêu thích.`,
    );
  };

  const handleTourClick = (tour: PublicTourCard) => {
    void trackRecommendationEvent({
      event_type: "tour_click",
      source: "tour_list",
      tour_id: tour.tour_id,
      destination: tour.destinations?.[0]?.name || undefined,
      metadata: {
        price: getTourPrice(tour),
        duration_days: tour.duration_days,
        departure_location: tour.departure_location?.name || null,
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8 lg:h-[calc(100dvh-64px)] lg:flex-row lg:gap-8 lg:overflow-hidden">
        <aside className="w-full flex-shrink-0 space-y-4 lg:h-full lg:w-[280px] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-gray-800">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Bộ lọc tìm kiếm
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
                  Từ khóa
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Tên, mã tour..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-[15px] font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
                  Điểm đến
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Bạn muốn đi đâu?"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-[15px] font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
                  Ngày đi
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-50 [color-scheme:light]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
                  Ngân sách
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={clearBudgetPreset}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-bold transition ${
                      !minPrice && !maxPrice
                        ? "bg-sky-100 text-sky-700"
                        : "text-slate-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    Tất cả mức giá
                    {!minPrice && !maxPrice && (
                      <span className="text-[10px]">●</span>
                    )}
                  </button>
                  {BUDGET_PRESETS.map((item) => {
                    const isActive =
                      (item.min_price || "") === minPrice &&
                      (item.max_price || "") === maxPrice;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => selectBudgetPreset(item)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                          isActive
                            ? "bg-sky-50 text-sky-600"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {item.label}
                        {isActive && <span className="text-[10px]">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="mt-2 w-full rounded-xl bg-sky-500 px-4 py-3 text-[14px] font-bold text-white shadow-lg shadow-sky-100 transition-all hover:bg-sky-600 hover:shadow-sky-200 active:scale-[0.98]"
              >
                ÁP DỤNG BỘ LỌC
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50/30 p-3 text-center">
            <p className="text-[12px] leading-relaxed text-sky-700/70">
              Tìm thấy <strong>{data?.total ?? 0}</strong> kết quả phù hợp cho
              hành trình của bạn.
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-6 lg:h-full lg:flex-1 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] md:flex-row md:items-center md:justify-between">
            <div className="text-[15px] font-medium text-gray-500">
              Chúng tôi tìm thấy{" "}
              <span className="font-bold text-sky-600">{data?.total ?? 0}</span>{" "}
              chương trình tour
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[14px] text-gray-400">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-[14px] font-medium text-gray-700 outline-none transition focus:border-sky-200 focus:bg-white"
              >
                {collection === "bestseller" && (
                  <option value="bestseller">Bán chạy nhất</option>
                )}
                <option value="nearest">Ngày khởi hành gần nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
              Đang tải danh sách tour...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl bg-white p-10 text-center text-red-600 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
              Không tìm thấy tour phù hợp với điều kiện bạn đã chọn.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-4">
              {items.map((tour) => (
                <article
                  key={tour.tour_id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
                    <div className="relative aspect-[16/9] md:aspect-auto">
                      <Image
                        src={normalizeImageSrc(tour.cover_image) || "/next.svg"}
                        alt={tour.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />

                      <FavoriteButton
                        active={isFavorite(tour.tour_id)}
                        loading={isPending(tour.tour_id)}
                        onClick={(event) =>
                          handleFavoriteClick(event, tour.tour_id, tour.name)
                        }
                        className={`absolute left-3 top-3 rounded-full p-2 shadow-sm transition-colors ${
                          isFavorite(tour.tour_id)
                            ? "bg-rose-500 text-white"
                            : "bg-white/90 text-gray-500 hover:text-rose-500"
                        }`}
                        iconClassName="h-5 w-5"
                      />
                    </div>

                    <div className="flex flex-col justify-between p-4 md:p-5">
                      <div>
                        <h2 className="mb-3 truncate text-[18px] font-bold leading-tight text-[#0f172a]">
                          {tour.name}
                        </h2>

                        <div className="grid grid-cols-1 gap-2 text-[14px] text-[#1f1f1f] md:grid-cols-2">
                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="shrink-0 font-semibold">Mã:</span>
                            <span className="truncate">{tour.code}</span>
                          </div>

                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="shrink-0 font-semibold">
                              Khởi hành:
                            </span>
                            <span className="truncate text-[#0d63b9]">
                              {tour.departure_location?.name || "Đang cập nhật"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="shrink-0 font-semibold">
                              Thời gian:
                            </span>
                            <span className="truncate">
                              {tour.duration_days}N{tour.duration_nights}Đ
                            </span>
                          </div>

                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <Hotel className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="shrink-0 font-semibold">
                              Khách sạn:
                            </span>
                            <span className="truncate">Tiêu chuẩn</span>
                          </div>

                          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <TransportIcon
                              type={tour.transport?.type}
                              className="h-4 w-4 shrink-0 text-gray-400"
                            />
                            <span className="shrink-0 font-semibold">
                              Phương tiện:
                            </span>
                            <span className="truncate">
                              {tour.transport?.type
                                ? getTransportLabel(tour.transport.type)
                                : "Đang cập nhật"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3 overflow-hidden">
                          <div className="flex shrink-0 items-center gap-1.5 text-[13px]">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="whitespace-nowrap font-bold text-gray-700">
                              Ngày khởi hành:
                            </span>
                          </div>
                          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                            {tour.upcoming_schedules &&
                            tour.upcoming_schedules.length > 0 ? (
                              tour.upcoming_schedules.map((s: TourSchedule) => {
                                const date = new Date(s.start_date);
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0",
                                );
                                const month = String(
                                  date.getMonth() + 1,
                                ).padStart(2, "0");

                                return (
                                  <span
                                    key={s.tour_schedule_id}
                                    className="whitespace-nowrap rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-[12px] font-bold text-sky-700 shadow-sm"
                                  >
                                    {day}/{month}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="whitespace-nowrap text-sm italic text-gray-400">
                                Liên hệ để biết thêm chi tiết
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {tour.destinations.length > 0 && (
                        <div className="mt-3 flex max-h-[24px] flex-wrap gap-1.5 overflow-hidden">
                          {tour.destinations.map((item, index) => (
                            <span
                              key={`${tour.tour_id}-${item.location_id}-${index}`}
                              className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-[#eef5ff] px-2 py-0.5 text-[11px] font-bold text-[#0d63b9]"
                            >
                              <MapPin size={10} className="shrink-0" />
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <p className="text-[14px] font-medium text-gray-500 whitespace-nowrap">
                                Giá chỉ từ:
                              </p>
                              {tour.next_schedule?.original_price &&
                                tour.next_schedule.original_price >
                                  tour.next_schedule.price && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-medium text-gray-400 line-through whitespace-nowrap">
                                      {formatVND(
                                        tour.next_schedule.original_price,
                                      )}
                                    </p>
                                    <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-600 border border-red-100">
                                      -{Math.round(((tour.next_schedule.original_price - tour.next_schedule.price) / tour.next_schedule.original_price) * 100)}%
                                    </span>
                                  </div>
                                )}
                            </div>
                            <p className="text-[22px] font-black tracking-tighter text-red-600 md:text-[24px] leading-tight mt-1">
                              {formatVND(getTourPrice(tour))}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/tours/${tour.tour_id}`}
                          onClick={() => handleTourClick(tour)}
                          className="min-w-[140px] rounded-xl bg-[#0d63b9] px-6 py-3 text-center text-[14px] font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#0a56a1] hover:shadow-blue-200 active:scale-95"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PublicToursPage() {
  return (
    <main className="min-h-full bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
        <ToursContent />
      </Suspense>
    </main>
  );
}
