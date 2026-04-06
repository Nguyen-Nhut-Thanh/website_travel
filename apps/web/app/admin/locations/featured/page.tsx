"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, Loader2, Save, Settings, Star } from "lucide-react";
import { FeaturedLocationsLeftPanel, FeaturedLocationsRightPanel } from "@/components/admin/featured-locations/FeaturedLocationsPanels";
import { useToast } from "@/components/common/Toast";
import {
  getAdminLocations,
  updateAdminLocation,
} from "@/lib/admin/locationsApi";
import {
  FEATURED_LIMIT,
  filterFeaturedTabs,
  filterRegionChildren,
  getCurrentFeatured,
  type LocationListResponse,
} from "@/lib/admin/featuredLocations";
import type { AdminLocationItem } from "@/types/admin-location";

export default function AdminFeaturedLocationsPage() {
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<AdminLocationItem[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);
  const [allChildren, setAllChildren] = useState<AdminLocationItem[]>([]);
  const [featured, setFeatured] = useState<AdminLocationItem[]>([]);

  const loadLocations = useCallback(async () => {
    const data = (await getAdminLocations<AdminLocationItem>()) as LocationListResponse;
    return data.items ?? [];
  }, []);

  const syncRegionChildren = useCallback((allItems: AdminLocationItem[], regionId: number) => {
    const children = filterRegionChildren(allItems, regionId);
    setAllChildren(children);
    setFeatured(getCurrentFeatured(children));
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const allItems = await loadLocations();
      const featuredTabs = filterFeaturedTabs(allItems);
      setRegions(featuredTabs);

      if (featuredTabs.length > 0) {
        const nextRegionId = activeRegionId ?? featuredTabs[0].location_id;
        setActiveRegionId(nextRegionId);
        syncRegionChildren(allItems, nextRegionId);
      } else {
        setActiveRegionId(null);
        setAllChildren([]);
        setFeatured([]);
      }
    } catch (requestError) {
      showError(
        requestError instanceof Error ? requestError.message : "Lỗi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }, [activeRegionId, loadLocations, showError, syncRegionChildren]);

  const loadRegionChildren = useCallback(
    async (regionId: number) => {
      setLoading(true);
      try {
        const allItems = await loadLocations();
        syncRegionChildren(allItems, regionId);
      } catch (requestError) {
        showError(
          requestError instanceof Error
            ? requestError.message
            : "Lỗi tải danh sách con",
        );
      } finally {
        setLoading(false);
      }
    },
    [loadLocations, showError, syncRegionChildren],
  );

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (activeRegionId && !loading) {
      void loadRegionChildren(activeRegionId);
    }
  }, [activeRegionId, loadRegionChildren, loading]);

  const toggleSelect = (location: AdminLocationItem) => {
    const isSelected = featured.some((item) => item.location_id === location.location_id);

    if (isSelected) {
      setFeatured((current) =>
        current.filter((item) => item.location_id !== location.location_id),
      );
      return;
    }

    if (featured.length >= FEATURED_LIMIT) {
      showError("Mỗi vùng chỉ được chọn tối đa 9 địa điểm");
      return;
    }

    const hasImage =
      location.featured_image ||
      (location.location_images && location.location_images.length > 0);
    if (!hasImage) {
      warning(`"${location.name}" chưa có ảnh đại diện.`);
    }

    setFeatured((current) => [
      ...current,
      { ...location, is_featured: true, featured_order: current.length + 1 },
    ]);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setFeatured((current) => {
      const next = [...current];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= next.length) {
        return current;
      }

      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!activeRegionId) return;

    setSaving(true);
    try {
      const toReset = allChildren.filter(
        (child) =>
          child.is_featured &&
          !featured.some((item) => item.location_id === child.location_id),
      );

      await Promise.all([
        ...toReset.map((location) =>
          updateAdminLocation(location.location_id, {
            is_featured: false,
            featured_order: null,
          }),
        ),
        ...featured.map((location, index) =>
          updateAdminLocation(location.location_id, {
            is_featured: true,
            featured_order: index + 1,
            featured_image: location.featured_image,
          }),
        ),
      ]);

      success("Đã cập nhật danh sách thành công");
      await loadRegionChildren(activeRegionId);
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi khi lưu dữ liệu",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && regions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/locations")}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold uppercase text-slate-900">Địa điểm yêu thích</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Quản lý các điểm đến nổi bật hiển thị tại trang chủ.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/locations")}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-200"
          >
            <Settings size={16} />
            Thiết lập Tag Miền
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !activeRegionId}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu thiết lập
          </button>
        </div>
      </div>

      {regions.length === 0 && !loading && (
        <div className="flex items-start gap-4 rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <div className="rounded-xl bg-white p-2 text-amber-600 shadow-sm">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Chưa có Tag Miền nào được cấu hình.
            </p>
            <p className="text-sm text-amber-700">
              Hãy vào mục <b>&quot;Quản lý địa điểm&quot;</b>, chọn Quốc gia hoặc Vùng miền
              (Level 3 hoặc 4) và tick vào ô <b>&quot;Nổi bật&quot;</b> để biến nó thành
              một tab hiển thị ở đây.
            </p>
          </div>
        </div>
      )}

      {regions.length > 0 && (
        <div className="mx-auto flex w-fit flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
          {regions.map((region) => (
            <button
              key={region.location_id}
              onClick={() => setActiveRegionId(region.location_id)}
              className={`rounded-xl px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeRegionId === region.location_id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <FeaturedLocationsLeftPanel
          allChildren={allChildren}
          featured={featured}
          onToggleSelect={toggleSelect}
        />
        <FeaturedLocationsRightPanel
          featured={featured}
          onMoveItem={moveItem}
          onToggleSelect={toggleSelect}
          onImageChange={(index, value) =>
            setFeatured((current) => {
              const next = [...current];
              next[index].featured_image = value;
              return next;
            })
          }
        />
      </div>
    </div>
  );
}
