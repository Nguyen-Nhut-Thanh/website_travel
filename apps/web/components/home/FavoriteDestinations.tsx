"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type {
  FeaturedDestinationGroup,
  FeaturedDestinationItem,
  FeaturedDestinationsResponse,
} from "@/types/location";
import { publicFetch } from "@/lib/publicFetch";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

function getCardClassName(index: number) {
  const layouts = [
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-1 md:col-end-4 md:row-start-1 md:row-end-7 h-full", // Ô 1: Cột 1-3, Hàng 1-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-4 md:col-end-6 md:row-start-1 md:row-end-4 h-full", // Ô 2: Cột 4-5, Hàng 1-3
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-4 h-full", // Ô 3: Cột 6-9, Hàng 1-3
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-4 md:col-end-6 md:row-start-4 md:row-end-7 h-full", // Ô 4: Cột 4-5, Hàng 4-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-8 md:row-start-4 md:row-end-7 h-full", // Ô 5: Cột 6-7, Hàng 4-6
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-8 md:col-end-10 md:row-start-4 md:row-end-10 h-full", // Ô 6: Cột 8-9, Hàng 4-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-1 md:col-end-3 md:row-start-7 md:row-end-10 h-full", // Ô 7: Cột 1-2, Hàng 7-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-3 md:col-end-6 md:row-start-7 md:row-end-10 h-full", // Ô 8: Cột 3-5, Hàng 7-9
    "relative group overflow-hidden rounded-2xl cursor-pointer md:col-start-6 md:col-end-8 md:row-start-7 md:row-end-10 h-full", // Ô 9: Cột 6-7, Hàng 7-9
  ];

  return (
    layouts[index] || "relative group overflow-hidden rounded-2xl cursor-pointer"
  );
}

function DestinationCard({
  item,
  index,
}: {
  item: FeaturedDestinationItem;
  index: number;
}) {
  // Hàm làm sạch tên: xóa "Tỉnh", "Thành phố", "TP.", "Thủ đô"
  const displayName = item.name
    .replace(/^(Tỉnh|Thành phố|TP\.|TP|Thủ đô)\s+/i, "")
    .trim();

  return (
    <a
      href={`/tours?destination=${encodeURIComponent(item.name)}`}
      className={getCardClassName(index)}
      aria-label={`Khám phá tour ${item.name}`}
    >
      <img
        src={item.image_url || FALLBACK_IMAGE}
        alt={item.alt_text || item.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-black/20 transition-all duration-500 group-hover:bg-black/40">
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 transition-all duration-300 group-hover:text-white group-hover:scale-110 md:text-lg drop-shadow-lg">
            {displayName}
          </h3>
        </div>
      </div>
    </a>
  );
}

export default function FavoriteDestinations() {
  const [regions, setRegions] = useState<FeaturedDestinationGroup[]>([]);
  const [activeRegionKey, setActiveRegionKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Refs for smooth tab indicator
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const data = await publicFetch<FeaturedDestinationsResponse>(
          "/locations/featured-destinations",
          {
            cache: "no-store",
          },
        );

        if (!isMounted) return;

        const nextRegions = data?.regions || [];
        setRegions(nextRegions);

        const firstNonEmptyRegion = nextRegions.find(
          (region) => region.items.length > 0,
        );

        setActiveRegionKey(
          firstNonEmptyRegion?.key || nextRegions[0]?.key || "",
        );
      } catch {
        if (!isMounted) return;

        setRegions([]);
        setActiveRegionKey("");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (!tabsRef.current || !activeRegionKey) return;

    const activeTabElement = tabsRef.current.querySelector(
      `[data-key="${activeRegionKey}"]`
    ) as HTMLElement;

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeRegionKey, regions]);

  const activeRegion = useMemo(() => {
    return regions.find((region) => region.key === activeRegionKey) || null;
  }, [regions, activeRegionKey]);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mb-10 space-y-3 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-wide text-[#1a2b48]">
          Điểm Đến Yêu Thích
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-500">
          Hãy chọn một điểm đến du lịch nổi bật để khám phá các chuyến đi phù
          hợp với nhu cầu, ngân sách và lịch trình của bạn.
        </p>
      </div>

      <div className="relative mb-12 flex justify-center border-b border-gray-100">
        <div 
          ref={tabsRef}
          className="relative flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {regions.map((region) => {
            const isActive = region.key === activeRegionKey;

            return (
              <button
                key={region.key}
                data-key={region.key}
                type="button"
                onClick={() => setActiveRegionKey(region.key)}
                className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 outline-none ${
                  isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {region.label}
              </button>
            );
          })}

          {/* Animated Indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 auto-rows-[120px] gap-2 md:grid-cols-9 md:auto-rows-[85px]">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className={`${getCardClassName(index)} animate-pulse bg-gray-100`}
            />
          ))}
        </div>
      ) : activeRegion && activeRegion.items.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 auto-rows-[250px] gap-2 md:grid-cols-9 md:auto-rows-[85px]">
          {activeRegion.items.map((item, index) => (
            <DestinationCard key={item.location_id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
          Hiện chưa có dữ liệu điểm đến để hiển thị.
        </div>
      )}
    </section>
  );
}
