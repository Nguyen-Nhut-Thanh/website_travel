"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Zap } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { FlashDealModal } from "@/components/admin/flash-deals/FlashDealModal";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import {
  buildFlashDealForm,
  buildFlashDealPayload,
  createDefaultFlashDealForm,
  filterFlashDealSchedules,
  FlashDealForm,
  FlashDealSchedule,
  previewFlashDealPrice,
} from "@/lib/admin/flashDeals";
import { formatVND } from "@/lib/utils";

export default function AdminFlashDealsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [schedules, setSchedules] = useState<FlashDealSchedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<FlashDealSchedule | null>(null);
  const [form, setForm] = useState<FlashDealForm>(createDefaultFlashDealForm);
  const { success, error: showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await adminFetch("/admin/marketing/flash-deals");

      if (!res.ok) {
        showError("Lỗi tải danh sách lịch trình");
        return;
      }

      setSchedules(await res.json());
    } catch {
      showError("Lỗi tải danh sách lịch trình");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSchedules = useMemo(
    () => filterFlashDealSchedules(schedules, searchTerm),
    [schedules, searchTerm],
  );

  const openDealModal = (schedule: FlashDealSchedule) => {
    setCurrentSchedule(schedule);
    setForm(buildFlashDealForm(schedule));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSchedule(null);
    setForm(createDefaultFlashDealForm());
  };

  const handleSaveDeal = async () => {
    if (!currentSchedule) {
      showError("Không tìm thấy lịch trình để áp dụng deal");
      return;
    }

    if (form.discount_value <= 0) {
      showError("Vui lòng nhập mức giảm giá hợp lệ");
      return;
    }

    setSaving(true);

    try {
      const existingDeal = currentSchedule.flash_deals;
      const url = existingDeal
        ? `/admin/marketing/flash-deals/${existingDeal.deal_id}`
        : "/admin/marketing/flash-deals";
      const method = existingDeal ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(buildFlashDealPayload(currentSchedule, form)),
      });

      if (!res.ok) {
        showError("Không thể cập nhật flash deal");
        return;
      }

      success("Đã cập nhật flash deal");
      closeModal();
      loadData();
    } catch {
      showError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: "Tour & lịch trình",
      render: (schedule: FlashDealSchedule) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase leading-none tracking-widest text-blue-600">
              {schedule.tours?.code}
            </span>
            <span className="line-clamp-1 font-bold text-slate-900">
              {schedule.tours?.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tighter text-slate-400">
            <Calendar size={12} />
            Khởi hành: {new Date(schedule.start_date).toLocaleDateString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      header: "Chỗ trống",
      align: "center" as const,
      render: (schedule: FlashDealSchedule) => (
        <span className="font-bold text-slate-700">
          {schedule.quota - (schedule._count?.bookings || 0)} / {schedule.quota}
        </span>
      ),
    },
    {
      header: "Giá gốc",
      align: "right" as const,
      render: (schedule: FlashDealSchedule) => (
        <span className="text-xs font-medium italic text-slate-400 line-through">
          {formatVND(schedule.price)}
        </span>
      ),
    },
    {
      header: "Ưu đãi",
      align: "center" as const,
      render: (schedule: FlashDealSchedule) =>
        schedule.flash_deals ? (
          <AdminStatusBadge tone="warning" icon={<Zap size={10} fill="currentColor" />}>
            {schedule.flash_deals.discount_type === "percentage"
              ? `-${schedule.flash_deals.discount_value}%`
              : `-${formatVND(schedule.flash_deals.discount_value)}`}
          </AdminStatusBadge>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest italic text-slate-300">
            Chưa có
          </span>
        ),
    },
    {
      header: "Giá deal",
      align: "right" as const,
      render: (schedule: FlashDealSchedule) => (
        <span className="text-sm font-black text-blue-600">
          {schedule.flash_deals
            ? formatVND(
                previewFlashDealPrice(
                  Number(schedule.price),
                  schedule.flash_deals.discount_type,
                  Number(schedule.flash_deals.discount_value),
                ),
              )
            : "-"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      align: "right" as const,
      render: (schedule: FlashDealSchedule) => (
        <button
          onClick={() => openDealModal(schedule)}
          className={`rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition-all ${
            schedule.flash_deals
              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "border-blue-600 bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
          }`}
        >
          {schedule.flash_deals ? "Sửa deal" : "Bật deal"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Flash Deals Giờ Chót"
        description="Danh sách các lịch khởi hành sắp tới để áp dụng ưu đãi giá hời."
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm tên tour hoặc mã tour..."
      />

      <AdminTable
        items={filteredSchedules}
        columns={columns}
        loading={loading}
        rowKey={(schedule) => schedule.tour_schedule_id}
        pageSize={10}
        itemLabel="flash deal"
        emptyMessage="Không tìm thấy lịch khởi hành nào"
      />

      <FlashDealModal
        open={showModal}
        saving={saving}
        schedule={currentSchedule}
        form={form}
        onClose={closeModal}
        onChange={(updater) => setForm((current) => updater(current))}
        onSave={handleSaveDeal}
      />
    </div>
  );
}
