"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { formatVND } from "@/lib/utils";
import {
  TOUR_TYPE_OPTIONS,
  getTourTypeBadgeClass,
  getTourTypeLabel,
  matchesTourSearch,
  matchesTourTypeFilter,
} from "@/lib/admin/tourManagement";

type Tour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  duration_nights: number;
  base_price: string | number;
  status: number;
  tour_type: string | null;
  tour_images?: { image_url: string; is_cover: number }[];
};

export default function AdminToursPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [items, setItems] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [pendingTourIds, setPendingTourIds] = useState<number[]>([]);

  const loadTours = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/admin/tours");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch {
      showError("Lỗi tải danh sách tour");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadTours();
  }, [loadTours]);

  const toggleStatus = async (tour: Tour) => {
    if (pendingTourIds.includes(tour.tour_id)) {
      return;
    }

    const nextStatus = tour.status === 1 ? 0 : 1;

    setPendingTourIds((current) => [...current, tour.tour_id]);
    setItems((current) =>
      current.map((item) =>
        item.tour_id === tour.tour_id ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      const response = await adminFetch(`/admin/tours/${tour.tour_id}/status`, {
        method: "PATCH",
      });

      if (!response.ok) {
        setItems((current) =>
          current.map((item) =>
            item.tour_id === tour.tour_id ? { ...item, status: tour.status } : item,
          ),
        );
        showError("Lỗi khi cập nhật trạng thái");
        return;
      }

      success(`Đã ${tour.status === 1 ? "tạm ẩn" : "kích hoạt"} tour thành công`);
    } catch {
      setItems((current) =>
        current.map((item) =>
          item.tour_id === tour.tour_id ? { ...item, status: tour.status } : item,
        ),
      );
      showError("Lỗi khi cập nhật trạng thái");
    } finally {
      setPendingTourIds((current) => current.filter((id) => id !== tour.tour_id));
    }
  };

  const filteredItems = useMemo(
    () =>
      items.filter(
        (tour) =>
          matchesTourSearch(tour, searchTerm) && matchesTourTypeFilter(tour, filterType),
      ),
    [items, searchTerm, filterType],
  );

  const columns = [
    {
      header: "Thông tin tour",
      render: (tour: Tour) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <ImageWithFallback
              src={tour.tour_images?.[0]?.image_url}
              alt={tour.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-slate-900 transition-colors group-hover:text-blue-600">
              {tour.name}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {tour.code}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getTourTypeBadgeClass(tour.tour_type)}`}
              >
                {getTourTypeLabel(tour.tour_type)}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Thời gian",
      render: (tour: Tour) => (
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Clock size={14} className="text-blue-500" />
          {tour.duration_days}N {tour.duration_nights}Đ
        </div>
      ),
    },
    {
      header: "Giá cơ bản",
      render: (tour: Tour) => (
        <span className="font-black text-blue-600">{formatVND(tour.base_price)}</span>
      ),
    },
    {
      header: "Trạng thái",
      render: (tour: Tour) => (
        <AdminStatusBadge tone={tour.status === 1 ? "success" : "warning"}>
          {tour.status === 1 ? "Hoạt động" : "Tạm ẩn"}
        </AdminStatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Tour"
        description="Danh sách tất cả các tour du lịch trong hệ thống."
        primaryAction={{
          label: "Thêm tour mới",
          onClick: () => router.push("/admin/tours/create"),
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo mã hoặc tên tour..."
          className="md:col-span-6"
        />

        <div className="ml-auto flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 md:col-span-6">
          {TOUR_TYPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilterType(option.id)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                filterType === option.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <AdminTable
        items={filteredItems}
        columns={columns}
        loading={loading}
        rowKey={(tour) => tour.tour_id}
        onEdit={(tour) => router.push(`/admin/tours/${tour.tour_id}`)}
        onDelete={toggleStatus}
        emptyMessage="Không tìm thấy tour nào phù hợp"
      />
    </div>
  );
}
