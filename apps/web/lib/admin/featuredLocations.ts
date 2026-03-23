import type { AdminLocationItem } from "@/types/admin-location";

export const FEATURED_LIMIT = 9;
const FEATURED_FALLBACK_ORDER = 99;

export type LocationListResponse = {
  items?: AdminLocationItem[];
};

export function sortFeaturedLocations(items: AdminLocationItem[]) {
  return [...items].sort(
    (left, right) =>
      (left.featured_order ?? FEATURED_FALLBACK_ORDER) -
      (right.featured_order ?? FEATURED_FALLBACK_ORDER),
  );
}

export function filterFeaturedTabs(items: AdminLocationItem[]) {
  return sortFeaturedLocations(items.filter((item) => item.is_featured && item.level_id <= 4));
}

export function filterRegionChildren(items: AdminLocationItem[], regionId: number) {
  return items.filter((item) => item.parent_id === regionId);
}

export function getCurrentFeatured(items: AdminLocationItem[]) {
  return sortFeaturedLocations(items.filter((item) => item.is_featured));
}
