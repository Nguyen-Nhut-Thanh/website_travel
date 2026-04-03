import Link from "next/link";
import Image from "next/image";
import { Star, Hash, MapPin, Calendar, Hotel } from "lucide-react";
import type { PublicTourCard } from "@/types/tour";
import { formatDate, formatVND, normalizeImageSrc } from "@/lib/utils";
import { getTourPriceValue, getTransportLabel } from "@/lib/tourDisplay";
import TransportIcon from "@/components/common/TransportIcon";
import TourMetaItem from "@/components/tours/list/TourMetaItem";

export default function TourCard({ tour }: { tour: PublicTourCard }) {
  const price = getTourPriceValue(tour.base_price, tour.next_schedule?.price);
  const startDate = formatDate(tour.next_schedule?.start_date);
  const imageSrc = normalizeImageSrc(tour.cover_image) || "/next.svg";

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

      <div className="space-y-3 p-4">
        <h3
          className="truncate text-[16px] font-bold text-[#0f172a]"
          title={tour.name}
        >
          {tour.name}
        </h3>

        <div className="space-y-1.5 text-[13px] text-gray-600">
          <TourMetaItem
            icon={<Hash className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
            label="Mã:"
            value={tour.code}
          />

          <TourMetaItem
            icon={<MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
            label="Điểm đi:"
            value={tour.departure_location?.name || "—"}
          />

          <TourMetaItem
            icon={<Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
            label="Ngày:"
            value={startDate || "Chưa có"}
          />

          <TourMetaItem
            icon={<Hotel className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
            label="K.Sạn:"
            value="Tiêu chuẩn"
          />

          <TourMetaItem
            icon={
              <TransportIcon
                type={tour.transport?.type}
                className="h-3.5 w-3.5 shrink-0 text-gray-400"
              />
            }
            label="P.Tiện:"
            value={
              tour.transport?.type
                ? getTransportLabel(tour.transport.type)
                : "Chính"
            }
          />
        </div>

        <div className="flex items-end justify-between border-t border-gray-50 pt-3">
          <div className="text-[17px] font-bold text-red-600">
            {formatVND(price)}
          </div>

          <div className="text-sm text-gray-600">
            {tour.rating_avg != null ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">
                  {tour.rating_avg.toFixed(1)}
                </span>
              </span>
            ) : (
              <span className="text-[12px] text-gray-400">New</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
