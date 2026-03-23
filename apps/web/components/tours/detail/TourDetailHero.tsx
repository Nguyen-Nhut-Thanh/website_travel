"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";
import { normalizeImageSrc } from "@/lib/utils";

type Props = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

export default function TourDetailHero({ tour, selectedSchedule }: Props) {
  const allImages = useMemo(() => {
    const images = [...(tour.tour_images || [])].sort(
      (a, b) => b.is_cover - a.is_cover || a.sort_order - b.sort_order,
    );

    if (selectedSchedule?.cover_image_url) {
      // Avoid duplicate if cover_image_url is already in tour_images
      const hasDuplicate = images.some(
        (img) => img.image_url === selectedSchedule.cover_image_url,
      );

      if (!hasDuplicate) {
        return [
          {
            image_id: -1, // Temporary ID
            image_url: selectedSchedule.cover_image_url,
            is_cover: 1,
            sort_order: 0,
          },
          ...images,
        ];
      } else {
        // Move the duplicate to the top
        const duplicateIndex = images.findIndex(
          (img) => img.image_url === selectedSchedule.cover_image_url,
        );
        const duplicate = images[duplicateIndex];
        const rest = [...images];
        rest.splice(duplicateIndex, 1);
        return [duplicate, ...rest];
      }
    }

    return images;
  }, [tour.tour_images, selectedSchedule?.cover_image_url]);

  const [activeImage, setActiveImage] = useState<string>(
    allImages[0]?.image_url || "",
  );

  // Update active image when selectedSchedule changes
  useEffect(() => {
    if (selectedSchedule?.cover_image_url) {
      setActiveImage(selectedSchedule.cover_image_url);
    } else if (allImages[0]?.image_url) {
      setActiveImage(allImages[0].image_url);
    }
  }, [selectedSchedule?.cover_image_url, allImages]);

  const activeSrc =
    normalizeImageSrc(activeImage) ||
    normalizeImageSrc(allImages[0]?.image_url) ||
    "/next.svg";

  return (
    <section className="bg-transparent pb-8 pt-0">
      <div>
        <h1
          title={tour.name}
          className="mb-8 max-w-full text-[34px] font-bold leading-[1.28] text-slate-900 md:text-[38px]"
        >
          {tour.name}
        </h1>

        <div className="grid gap-4 lg:grid-cols-[76px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:flex lg:flex-col lg:gap-2">
            {allImages.slice(0, 4).map((image, index) => {
              const isActive = activeImage === image.image_url;
              const remainCount = allImages.length - 4;

              return (
                <button
                  key={image.image_id}
                  type="button"
                  onClick={() => setActiveImage(image.image_url)}
                  className={`relative aspect-[5/4] overflow-hidden rounded-lg border transition ${
                    isActive
                      ? "border-[#0b63b6] ring-2 ring-[#0b63b6]/15"
                      : "border-slate-200"
                  }`}
                >
                  <Image
                    src={normalizeImageSrc(image.image_url) || "/next.svg"}
                    alt={tour.name}
                    fill
                    className="object-cover"
                    sizes="76px"
                  />
                  {index === 3 && remainCount > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-lg font-bold text-white">
                      +{remainCount}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={activeSrc}
                alt={tour.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
              {allImages.slice(0, 5).map((image) => {
                const isActive = activeImage === image.image_url;

                return (
                  <button
                    key={image.image_id}
                    type="button"
                    onClick={() => setActiveImage(image.image_url)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border ${
                      isActive ? "border-[#0b63b6]" : "border-slate-200"
                    }`}
                  >
                    <Image
                      src={normalizeImageSrc(image.image_url) || "/next.svg"}
                      alt={tour.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
