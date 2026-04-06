"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "@/lib/auth";
import {
  addFavoriteTour,
  getFavoriteIds,
  removeFavoriteTour,
} from "@/lib/authApi";

type ToggleFavoriteResult =
  | { ok: true; action: "added" | "removed" }
  | { ok: false; reason: "unauthenticated" | "error"; message: string };

export function useFavoriteTours() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const loadFavoriteIds = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    try {
      const data = await getFavoriteIds();
      setFavoriteIds(Array.isArray(data?.items) ? data.items : []);
    } catch {
      // Ignore background sync failures and keep the current local state.
    }
  }, []);

  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const loadingIdSet = useMemo(() => new Set(loadingIds), [loadingIds]);

  const isFavorite = useCallback(
    (tourId: number) => favoriteIdSet.has(tourId),
    [favoriteIdSet],
  );

  const isPending = useCallback(
    (tourId: number) => loadingIdSet.has(tourId),
    [loadingIdSet],
  );

  const toggleFavorite = useCallback(
    async (tourId: number): Promise<ToggleFavoriteResult> => {
      const token = getToken();
      if (!token) {
        return {
          ok: false,
          reason: "unauthenticated",
          message: "Vui lòng đăng nhập để lưu tour yêu thích.",
        };
      }

      const currentlyFavorite = favoriteIdSet.has(tourId);
      setLoadingIds((prev) => [...prev, tourId]);

      try {
        if (currentlyFavorite) {
          await removeFavoriteTour(tourId);
        } else {
          await addFavoriteTour(tourId);
        }

        setFavoriteIds((prev) => {
          if (currentlyFavorite) {
            return prev.filter((id) => id !== tourId);
          }

          return prev.includes(tourId) ? prev : [...prev, tourId];
        });

        return {
          ok: true,
          action: currentlyFavorite ? "removed" : "added",
        };
      } catch {
        return {
          ok: false,
          reason: "error",
          message: "Không thể cập nhật danh sách yêu thích.",
        };
      } finally {
        setLoadingIds((prev) => prev.filter((id) => id !== tourId));
      }
    },
    [favoriteIdSet],
  );

  return {
    favoriteIds,
    isFavorite,
    isPending,
    toggleFavorite,
    refreshFavoriteIds: loadFavoriteIds,
  };
}
