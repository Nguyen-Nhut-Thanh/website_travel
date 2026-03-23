"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Banner } from "../../../types/banner";
import { normalizeImageSrc } from "@/lib/utils";

type BannerItem = Banner & {
  description: string;
  link_to: string;
};

type ActiveBannerState = {
  banner_id: number;
  location_name: string;
  header: string;
  description: string;
  image_url: string;
  link_to: string;
};

type UseHeroBannerSliderParams = {
  banners: Banner[];
  autoSlideDelay?: number;
  slideAnimationDuration?: number;
};

type UseHeroBannerSliderReturn = {
  normalizedBanners: BannerItem[];
  slideContainerRef: React.RefObject<HTMLDivElement | null>;
  activeBanner: ActiveBannerState | null;
  animateKey: number;
  totalItems: number;
  currentIndex: number;
  progressWidth: string;
  handleNextSlide: () => void;
  handlePrevSlide: () => void;
  handleContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export function useHeroBannerSlider({
  banners,
  autoSlideDelay = 5000,
  slideAnimationDuration = 800,
}: UseHeroBannerSliderParams): UseHeroBannerSliderReturn {
  const normalizedBanners = useMemo<BannerItem[]>(() => {
    if (!Array.isArray(banners)) return [];

    return banners
      .filter(
        (item) =>
          item &&
          typeof item.banner_id === "number" &&
          typeof item.location_name === "string" &&
          typeof item.header === "string" &&
          typeof item.image_url === "string",
      )
      .map((item) => ({
        ...item,
        image_url: normalizeImageSrc(item.image_url) || "/images/fallback-banner.jpg",
        description:
          typeof item.description === "string" ? item.description : "",
        link_to:
          typeof item.link_to === "string" && item.link_to.trim()
            ? item.link_to
            : "#",
      }));
  }, [banners]);

  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const autoSlideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const transitionUnlockTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isTransitioningRef = useRef(false);

  const [activeBanner, setActiveBanner] = useState<ActiveBannerState | null>(
    null,
  );
  const [animateKey, setAnimateKey] = useState(0);

  const totalItems = normalizedBanners.length;

  const clearAutoSlide = useCallback(() => {
    if (autoSlideTimeoutRef.current) {
      clearTimeout(autoSlideTimeoutRef.current);
      autoSlideTimeoutRef.current = null;
    }
  }, []);

  const clearTransitionUnlock = useCallback(() => {
    if (transitionUnlockTimeoutRef.current) {
      clearTimeout(transitionUnlockTimeoutRef.current);
      transitionUnlockTimeoutRef.current = null;
    }
  }, []);

  const getSlideItems = useCallback(() => {
    const container = slideContainerRef.current;
    if (!container) return [];
    return Array.from(
      container.querySelectorAll<HTMLDivElement>(".hero-banner-item"),
    );
  }, []);

  const updateHeroContent = useCallback(() => {
    const items = getSlideItems();
    const activeItem = items[1] ?? items[0];

    if (!activeItem) return;

    const nextActive: ActiveBannerState = {
      banner_id: Number(activeItem.dataset.bannerId || 0),
      location_name: activeItem.dataset.location || "",
      header: activeItem.dataset.title || "",
      description: activeItem.dataset.description || "",
      image_url: activeItem.dataset.imageUrl || "",
      link_to: activeItem.dataset.linkTo || "#",
    };

    setActiveBanner(nextActive);
    setAnimateKey((prev) => prev + 1);
  }, [getSlideItems]);

  const runUpdateHeroSoon = useCallback(() => {
    requestAnimationFrame(() => {
      updateHeroContent();
    });
  }, [updateHeroContent]);

  const unlockTransitionLaterRef = useRef<(() => void) | null>(null);

  const unlockTransitionLater = useCallback(() => {
    clearTransitionUnlock();

    transitionUnlockTimeoutRef.current = setTimeout(() => {
      isTransitioningRef.current = false;

      clearAutoSlide();

      if (totalItems > 1) {
        autoSlideTimeoutRef.current = setTimeout(() => {
          const container = slideContainerRef.current;
          if (!container || isTransitioningRef.current) return;

          const items = getSlideItems();
          if (!items.length) return;

          isTransitioningRef.current = true;
          container.appendChild(items[0]);

          runUpdateHeroSoon();
          
          // Trigger next cycle via a side effect or a simple function
          requestAnimationFrame(() => {
            unlockTransitionLaterRef.current?.();
          });
        }, autoSlideDelay);
      }
    }, slideAnimationDuration);
  }, [
    autoSlideDelay,
    clearAutoSlide,
    clearTransitionUnlock,
    getSlideItems,
    runUpdateHeroSoon,
    slideAnimationDuration,
    totalItems,
  ]);

  useEffect(() => {
    unlockTransitionLaterRef.current = unlockTransitionLater;
  }, [unlockTransitionLater]);

  const handleNextSlide = useCallback(() => {
    const container = slideContainerRef.current;
    if (!container || isTransitioningRef.current) return;

    const items = getSlideItems();
    if (!items.length) return;

    clearAutoSlide();
    isTransitioningRef.current = true;
    container.appendChild(items[0]);

    runUpdateHeroSoon();
    unlockTransitionLater();
  }, [clearAutoSlide, getSlideItems, runUpdateHeroSoon, unlockTransitionLater]);

  const handlePrevSlide = useCallback(() => {
    const container = slideContainerRef.current;
    if (!container || isTransitioningRef.current) return;

    const items = getSlideItems();
    if (!items.length) return;

    clearAutoSlide();
    isTransitioningRef.current = true;
    container.prepend(items[items.length - 1]);

    runUpdateHeroSoon();
    unlockTransitionLater();
  }, [clearAutoSlide, getSlideItems, runUpdateHeroSoon, unlockTransitionLater]);

  const moveToSlide = useCallback(
    (clickedElement: HTMLDivElement) => {
      const container = slideContainerRef.current;
      if (!container || isTransitioningRef.current) return;

      const items = getSlideItems();
      const clickedIndex = items.indexOf(clickedElement);

      if (clickedIndex <= 1) return;

      clearAutoSlide();
      isTransitioningRef.current = true;

      const moves = clickedIndex - 1;

      for (let i = 0; i < moves; i += 1) {
        const currentItems = Array.from(
          container.querySelectorAll<HTMLDivElement>(".hero-banner-item"),
        );

        if (!currentItems.length) break;
        container.appendChild(currentItems[0]);
      }

      runUpdateHeroSoon();
      unlockTransitionLater();
    },
    [clearAutoSlide, getSlideItems, runUpdateHeroSoon, unlockTransitionLater],
  );

  const handleContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const clickedItem = target.closest(
        ".hero-banner-item",
      ) as HTMLDivElement | null;
      if (!clickedItem) return;
      moveToSlide(clickedItem);
    },
    [moveToSlide],
  );

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      updateHeroContent();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [updateHeroContent]);

  useEffect(() => {
    clearAutoSlide();

    if (totalItems > 1) {
      autoSlideTimeoutRef.current = setTimeout(() => {
        const container = slideContainerRef.current;
        if (!container || isTransitioningRef.current) return;

        const items = getSlideItems();
        if (!items.length) return;

        isTransitioningRef.current = true;
        container.appendChild(items[0]);

        runUpdateHeroSoon();
        unlockTransitionLater();
      }, autoSlideDelay);
    }

    return () => {
      clearAutoSlide();
      clearTransitionUnlock();
    };
  }, [
    autoSlideDelay,
    clearAutoSlide,
    clearTransitionUnlock,
    getSlideItems,
    runUpdateHeroSoon,
    totalItems,
    unlockTransitionLater,
  ]);

  const currentIndex = useMemo(() => {
    if (!activeBanner || !normalizedBanners.length) return 0;
    const idx = normalizedBanners.findIndex(b => b.banner_id === activeBanner.banner_id);
    return idx !== -1 ? idx + 1 : 1;
  }, [activeBanner, normalizedBanners]);

  const progressWidth =
    totalItems > 0 ? `${(currentIndex / totalItems) * 100}%` : "0%";

  return {
    normalizedBanners,
    slideContainerRef,
    activeBanner,
    animateKey,
    totalItems,
    currentIndex,
    progressWidth,
    handleNextSlide,
    handlePrevSlide,
    handleContainerClick,
  };
}
