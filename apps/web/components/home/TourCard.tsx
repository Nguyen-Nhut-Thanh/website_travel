import Link from "next/link";
import Image from "next/image";
import type { TourCard as TourCardType } from "@/types/tour";

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

function normalizeImageSrc(src?: string | null) {
  if (!src || !src.trim()) {
    return "/images/fallback-tour.jpg";
  }

  const value = src.trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

export default function TourCard({ tour }: { tour: TourCardType }) {
  const price = tour.next_schedule?.price ?? tour.base_price;

  const startDate = tour.next_schedule?.start_date
    ? new Date(tour.next_schedule.start_date).toLocaleDateString("vi-VN")
    : null;

  const imageSrc = normalizeImageSrc(tour.cover_image);

  return (
    <Link
      href={`/tours/${tour.tour_id}`}
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={imageSrc}
          alt={tour.name}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold">{tour.name}</h3>
          <span className="shrink-0 rounded-full border px-2 py-1 text-xs text-gray-600">
            {tour.duration_days}N
            {tour.duration_nights ? `${tour.duration_nights}Đ` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
          <span>Điểm đi: {tour.departure_location?.name || "—"}</span>
          {startDate && <span>Khởi hành: {startDate}</span>}
        </div>

        <div className="flex items-end justify-between pt-1">
          <div className="text-lg font-bold">{formatVND(price)}</div>

          <div className="text-sm text-gray-600">
            {tour.rating_avg != null ? (
              <span>
                ⭐ {tour.rating_avg.toFixed(1)} ({tour.rating_count})
              </span>
            ) : (
              <span className="text-gray-400">Chưa có đánh giá</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
