"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Layers, MapPin, Star, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/Toast";
import {
  deleteAdminLocation,
  getAdminLocationLevels,
  getAdminLocations,
} from "@/lib/admin/locationsApi";
import { getLocationLevelLabel } from "@/lib/admin/locationDetail";

type LocationLevel = {
  level_id: number;
  name: string;
};

type LocationItem = {
  location_id: number;
  name: string;
  slug: string;
  level_id: number;
  is_featured?: boolean;
  geographic_levels?: {
    name?: string | null;
  } | null;
  locations?: {
    name?: string | null;
  } | null;
};

export default function AdminLocationsPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LocationItem[]>([]);
  const [levels, setLevels] = useState<LocationLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [pendingDelete, setPendingDelete] = useState<LocationItem | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [locationData, levelData] = await Promise.all([
        getAdminLocations<LocationItem>(),
        getAdminLocationLevels<LocationLevel>(),
      ]);
      setItems(locationData.items || []);
      setLevels(levelData);
    } catch {
      showError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleDelete = async (item: LocationItem) => {
    setPendingDelete(item);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteAdminLocation(pendingDelete.location_id);
      success("Đã xóa địa điểm thành công");
      setItems((current) =>
        current.filter((location) => location.location_id !== pendingDelete.location_id),
      );
      setPendingDelete(null);
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi kết nối máy chủ",
      );
    }
  };

  const filteredItems = items.filter((item) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.slug.toLowerCase().includes(normalizedSearch);
    const matchesLevel = selectedLevel === "" || String(item.level_id) === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const columns = [
    {
      header: "Địa điểm",
      render: (item: LocationItem) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <MapPin size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{item.name}</p>
            <p className="font-mono text-[11px] text-slate-500">slug: {item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Cấp độ",
      align: "center" as const,
      render: (item: LocationItem) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
            item.level_id <= 4
              ? "border-indigo-100 bg-indigo-50 text-indigo-600"
              : item.level_id === 5
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-slate-100 text-slate-500"
          }`}
        >
          {getLocationLevelLabel(item.level_id, item.geographic_levels?.name || "")}
        </span>
      ),
    },
    {
      header: "Thuộc cấp cha",
      render: (item: LocationItem) =>
        item.locations?.name ? (
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <Layers size={14} className="text-slate-400" />
            {item.locations.name}
          </div>
        ) : (
          <span className="text-xs italic text-slate-300">Gốc (Quốc gia)</span>
        ),
    },
    {
      header: "Nổi bật (tag)",
      align: "center" as const,
      render: (item: LocationItem) =>
        item.is_featured ? (
          <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-600">
            <Star size={10} fill="currentColor" /> Nổi bật
          </span>
        ) : (
          <span className="text-slate-300">---</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Địa điểm"
        description="Quản lý danh mục vùng miền, tỉnh thành và các điểm tham quan."
        actions={
          <button
            onClick={() => router.push("/admin/locations/featured")}
            className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            <Star size={18} fill="currentColor" /> Thiết lập grid
          </button>
        }
        primaryAction={{
          label: "Thêm địa điểm",
          onClick: () => router.push("/admin/locations/new"),
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên địa điểm..."
          className="md:col-span-8"
        />
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 md:col-span-4">
          <Filter size={16} className="text-slate-400" />
          <select
            className="w-full bg-transparent py-2.5 text-sm font-medium text-slate-600 outline-none"
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(event.target.value)}
          >
            <option value="">Tất cả cấp độ</option>
            {levels.map((level) => (
              <option key={level.level_id} value={level.level_id}>
                {getLocationLevelLabel(level.level_id, level.name)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AdminTable
        items={filteredItems}
        columns={columns}
        loading={loading}
        rowKey={(item) => item.location_id}
        onEdit={(item) => router.push(`/admin/locations/${item.location_id}`)}
        onDelete={handleDelete}
        emptyMessage="Không tìm thấy địa điểm nào phù hợp"
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        icon={<Trash2 size={28} />}
        title="Xác nhận xóa địa điểm"
        description={
          pendingDelete
            ? `Địa điểm "${pendingDelete.name}" sẽ bị xóa vĩnh viễn nếu không còn liên kết dữ liệu. Hệ thống sẽ chặn thao tác này khi địa điểm đang có địa điểm con, được tour sử dụng, có khách sạn liên kết hoặc còn dữ liệu chi tiết điểm đến.`
            : ""
        }
        confirmLabel="Xóa địa điểm"
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
