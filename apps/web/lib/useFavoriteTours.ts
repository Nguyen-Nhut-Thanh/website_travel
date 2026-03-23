"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE, getToken } from "@/lib/auth";

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
      const res = await fetch(`${API_BASE}/favorites/ids`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
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
        const res = await fetch(`${API_BASE}/favorites/${tourId}`, {
          method: currentlyFavorite ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          return {
            ok: false,
            reason: "error",
            message: data?.message || "Không thể cập nhật danh sách yêu thích.",
          };
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
