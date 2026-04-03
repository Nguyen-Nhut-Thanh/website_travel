"use client";

import { useState } from "react";
import Image from "next/image";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";
import { normalizeImageSrc } from "@/lib/utils";

type Props = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

function buildHeroImages(
  tourImages: PublicTourDetail["tour_images"],
  selectedSchedule?: TourSchedule | null,
) {
  const images = [...(tourImages || [])].sort(
    (left, right) => right.is_cover - left.is_cover || left.sort_order - right.sort_order,
  );

  if (!selectedSchedule?.cover_image_url) {
    return images;
  }

  const duplicateIndex = images.findIndex(
    (image) => image.image_url === selectedSchedule.cover_image_url,
  );

  if (duplicateIndex === -1) {
    return [
      {
        image_id: -1,
        image_url: selectedSchedule.cover_image_url,
        is_cover: 1,
        sort_order: 0,
      },
      ...images,
    ];
  }

  const duplicate = images[duplicateIndex];
  const remainingImages = [...images];
  remainingImages.splice(duplicateIndex, 1);
  return [duplicate, ...remainingImages];
}

export default function TourDetailHero({ tour, selectedSchedule }: Props) {
  const allImages = buildHeroImages(tour.tour_images, selectedSchedule);
  const defaultActiveImage =
    selectedSchedule?.cover_image_url || allImages[0]?.image_url || "";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const activeImage =
    selectedImage &&
    allImages.some((image) => image.image_url === selectedImage)
      ? selectedImage
      : defaultActiveImage;

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
                  onClick={() => setSelectedImage(image.image_url)}
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
                    onClick={() => setSelectedImage(image.image_url)}
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
