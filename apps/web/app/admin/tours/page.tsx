"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  ScrollText,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useToast } from "@/components/common/Toast";
import {
  TOUR_STATUS_OPTIONS,
  TOUR_TYPE_OPTIONS,
  getTourTypeBadgeClass,
  getTourTypeLabel,
  matchesTourSearch,
  matchesTourStatusFilter,
  matchesTourTypeFilter,
} from "@/lib/admin/tourManagement";
import {
  deleteAdminTour,
  getAdminTours,
  toggleAdminTourStatus,
} from "@/lib/admin/toursApi";
import { formatVND } from "@/lib/utils";

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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [pendingTourIds, setPendingTourIds] = useState<number[]>([]);
  const [pendingDeleteTour, setPendingDeleteTour] = useState<Tour | null>(null);

  const loadTours = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTours<Tour>();
      setItems(data.items || []);
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
    if (pendingTourIds.includes(tour.tour_id)) return;

    const nextStatus = tour.status === 1 ? 0 : 1;

    setPendingTourIds((current) => [...current, tour.tour_id]);
    setItems((current) =>
      current.map((item) =>
        item.tour_id === tour.tour_id ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      await toggleAdminTourStatus(tour.tour_id);
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

  const handleDeleteTour = async (tour: Tour) => {
    try {
      await deleteAdminTour(tour.tour_id);
      success("Đã xóa tour thành công");
      setItems((current) =>
        current.filter((item) => item.tour_id !== tour.tour_id),
      );
      setPendingDeleteTour(null);
    } catch {
      showError("Lỗi kết nối");
    }
  };

  const filteredItems = useMemo(
    () =>
      items.filter(
        (tour) =>
          matchesTourSearch(tour, searchTerm) &&
          matchesTourTypeFilter(tour, filterType) &&
          matchesTourStatusFilter(tour, filterStatus),
      ),
    [items, searchTerm, filterStatus, filterType],
  );

  const columns = [
    {
      header: "Thông tin tour",
      className: "w-[460px] min-w-[460px] max-w-[460px]",
      render: (tour: Tour) => (
        <div className="flex min-w-0 items-center gap-4">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <ImageWithFallback
              src={tour.tour_images?.[0]?.image_url}
              alt={tour.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-600"
              title={tour.name}
            >
              {tour.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {tour.code}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getTourTypeBadgeClass(
                  tour.tour_type,
                )}`}
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
      className: "w-[120px] whitespace-nowrap",
      render: (tour: Tour) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-600">
          <Clock size={14} className="text-blue-500" />
          {tour.duration_days}N {tour.duration_nights}Đ
        </div>
      ),
    },
    {
      header: "Giá cơ bản",
      className: "w-[150px] whitespace-nowrap",
      render: (tour: Tour) => (
        <span className="whitespace-nowrap font-black text-blue-600">
          {formatVND(tour.base_price)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "w-[140px] whitespace-nowrap",
      render: (tour: Tour) => (
        <AdminStatusBadge tone={tour.status === 1 ? "success" : "warning"}>
          {tour.status === 1 ? "Hoạt động" : "Tạm ẩn"}
        </AdminStatusBadge>
      ),
    },
  ];

  return (
    <div className="relative space-y-6">
      <AdminPageHeader
        title="Quản lý Tour"
        description="Danh sách tất cả các tour du lịch trong hệ thống."
        primaryAction={{
          label: "Thêm tour mới",
          onClick: () => router.push("/admin/tours/create"),
        }}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo mã hoặc tên tour..."
          className="xl:min-w-[280px]"
        />

        <div className="flex w-fit flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
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

        <div className="flex w-fit flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
          {TOUR_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilterStatus(option.id)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                filterStatus === option.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
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
        onDelete={(tour) => setPendingDeleteTour(tour)}
        extraActions={[
          {
            icon: (tour) =>
              tour.status === 1 ? <EyeOff size={16} /> : <Eye size={16} />,
            title: (tour) => (tour.status === 1 ? "Ẩn tour" : "Bật lại tour"),
            tone: "primary",
            onClick: toggleStatus,
          },
          {
            icon: <ScrollText size={16} />,
            title: "Lưu ý tour",
            tone: "primary",
            onClick: (tour) => router.push(`/admin/tours/${tour.tour_id}/policies`),
          },
        ]}
        emptyMessage="Không tìm thấy tour nào phù hợp"
      />

      <ConfirmDialog
        open={pendingDeleteTour !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa tour?"
        description={`Tour "${
          pendingDeleteTour?.name || ""
        }" sẽ bị xóa nếu chưa phát sinh khách đặt ở các lịch khởi hành liên quan.`}
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteTour) {
            void handleDeleteTour(pendingDeleteTour);
          }
        }}
        onCancel={() => setPendingDeleteTour(null)}
      />
    </div>
  );
}
