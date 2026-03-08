"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublicTours } from "../../lib/publicFetch";
import { PublicTourCard, PublicToursResponse } from "../../types/tour";

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

function formatMoney(value?: number | null) {
  if (value == null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getTourPrice(tour: PublicTourCard) {
  if (tour.next_schedule?.price != null)
    return Number(tour.next_schedule.price);
  return Number(tour.base_price);
}

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = `${today.getMonth() + 1}`.padStart(2, "0");
  const dd = `${today.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getActiveBudgetLabel(minPrice: string, maxPrice: string) {
  const match = BUDGET_PRESETS.find(
    (item) =>
      (item.min_price || "") === minPrice &&
      (item.max_price || "") === maxPrice,
  );

  return match?.label || "Tất cả";
}

export default function PublicToursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PublicToursResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") || "",
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState("nearest");

  const query = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      destination: searchParams.get("destination") || "",
      departure_location: searchParams.get("departure_location") || "",
      date_from: searchParams.get("date_from") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      take: "20",
      skip: "0",
    }),
    [searchParams],
  );

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
    setDestination(searchParams.get("destination") || "");
    setDateFrom(searchParams.get("date_from") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getPublicTours(query);
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

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-[30px] font-bold uppercase tracking-tight text-[#1f1f1f] lg:text-[32px]">
              Bộ lọc tìm kiếm
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-3 block text-lg font-bold text-[#1f1f1f]">
                  Từ khóa
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tên tour, mã tour..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-3 block text-lg font-bold text-[#1f1f1f]">
                  Ngân sách
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={clearBudgetPreset}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      !minPrice && !maxPrice
                        ? "border-[#0d63b9] bg-[#0d63b9] text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#0d63b9]"
                    }`}
                  >
                    Tất cả
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "border-[#0d63b9] bg-[#0d63b9] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#0d63b9]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-lg font-bold text-[#1f1f1f]">
                  Điểm đến
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Ví dụ: Hà Nội"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-3 block text-lg font-bold text-[#1f1f1f]">
                  Ngày đi
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 [color-scheme:light]"
                />
              </div>

              <div className="rounded-xl bg-[#f7f9fc] p-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-[#1f1f1f]">
                    Bộ lọc hiện tại:
                  </span>{" "}
                  {getActiveBudgetLabel(minPrice, maxPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={applyFilters}
                className="w-full rounded-xl bg-[#0d63b9] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#0a56a1]"
              >
                Áp dụng
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="text-[18px] text-[#1f1f1f]">
                Chúng tôi tìm thấy{" "}
                <span className="text-[34px] font-bold leading-none text-[#0d63b9]">
                  {data?.total ?? 0}
                </span>{" "}
                chương trình tour cho quý khách
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[16px] font-medium text-[#1f1f1f]">
                  Sắp xếp theo:
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-w-[240px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-medium outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="nearest">Ngày khởi hành gần nhất</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
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
              <div className="space-y-5">
                {items.map((tour) => (
                  <article
                    key={tour.tour_id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[370px_minmax(0,1fr)]">
                      <div className="relative">
                        <div className="aspect-[4/3] bg-gray-100 md:h-full">
                          {tour.cover_image ? (
                            <img
                              src={tour.cover_image}
                              alt={tour.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                              Không có ảnh
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="absolute left-3 top-3 rounded-full bg-white/90 p-2 text-gray-500 shadow-sm"
                          aria-label="Yêu thích"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m12 21-1.45-1.32C5.4 15.03 2 11.94 2 8.15 2 5.06 4.42 2.7 7.5 2.7c1.74 0 3.41.81 4.5 2.09A6.1 6.1 0 0 1 16.5 2.7C19.58 2.7 22 5.06 22 8.15c0 3.79-3.4 6.88-8.55 11.54z" />
                          </svg>
                        </button>

                        <div className="absolute bottom-3 left-3 rounded-lg bg-[#ef2c84] px-4 py-2 text-sm font-semibold text-white">
                          Tiết kiệm
                        </div>
                      </div>

                      <div className="p-5 md:p-6">
                        <h2 className="line-clamp-2 text-[22px] font-bold leading-snug text-[#0f172a]">
                          {tour.name}
                        </h2>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-[16px] text-[#1f1f1f] md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">🧾</span>
                            <span>
                              Mã tour:{" "}
                              <span className="font-bold text-[#0f172a]">
                                {tour.code}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">📍</span>
                            <span>
                              Khởi hành:{" "}
                              <span className="font-semibold text-[#0d63b9]">
                                {tour.departure_location?.name ||
                                  "Đang cập nhật"}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">⏱️</span>
                            <span>
                              Thời gian:{" "}
                              <span className="font-semibold">
                                {tour.duration_days}N{tour.duration_nights}Đ
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">⭐</span>
                            <span>
                              Đánh giá:{" "}
                              <span className="font-semibold">
                                {tour.rating_avg != null
                                  ? `${tour.rating_avg.toFixed(1)} / 5`
                                  : "Chưa có"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-[16px] font-medium text-[#1f1f1f]">
                            Ngày khởi hành:
                          </span>

                          {tour.next_schedule?.start_date ? (
                            <span className="rounded-md border border-red-500 px-3 py-1 text-sm font-semibold text-red-500">
                              {formatDate(tour.next_schedule.start_date)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Chưa có lịch gần nhất
                            </span>
                          )}
                        </div>

                        {tour.destinations.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tour.destinations.map((item, index) => (
                              <span
                                key={`${tour.tour_id}-${item.location_id}-${index}`}
                                className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-sm font-medium text-[#0d63b9]"
                              >
                                {item.name || "Điểm đến"}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-[16px] text-[#1f1f1f]">
                              Giá từ:
                            </p>
                            <p className="mt-1 text-[20px] font-bold text-red-600 md:text-[24px]">
                              {formatMoney(getTourPrice(tour))}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="rounded-lg bg-[#0d63b9] px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-[#0a56a1]"
                          >
                            Xem chi tiết
                          </button>
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
    </main>
  );
}
