"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Tag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { VoucherModal } from "@/components/admin/vouchers/VoucherModal";
import { VoucherStatusFilterTabs } from "@/components/admin/vouchers/VoucherStatusFilterTabs";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import {
  buildVoucherForm,
  buildVoucherPayload,
  createDefaultVoucherForm,
  filterVouchers,
  getVoucherDateParts,
  Voucher,
  VoucherForm,
  VoucherStatusFilter,
} from "@/lib/admin/vouchers";
import { formatVND } from "@/lib/utils";
import { isVoucherLocked } from "@/lib/vouchers";

export default function AdminVouchersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VoucherStatusFilter>("all");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(createDefaultVoucherForm);
  const { success, error: showError } = useToast();

  const isReadonlyVoucher = !!editingVoucher;
  const { minDate, minTime, startDateValue, startTimeValue } = getVoucherDateParts(
    form.start_date,
  );

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await adminFetch("/admin/marketing/vouchers");

      if (!res.ok) {
        showError("Lỗi tải danh sách voucher");
        return;
      }

      setVouchers(await res.json());
    } catch {
      showError("Lỗi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredVouchers = useMemo(
    () => filterVouchers(vouchers, searchTerm, statusFilter),
    [vouchers, searchTerm, statusFilter],
  );

  const openVoucherModal = (voucher: Voucher | null = null) => {
    setEditingVoucher(voucher);
    setForm(voucher ? buildVoucherForm(voucher) : createDefaultVoucherForm());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVoucher(null);
    setForm(createDefaultVoucherForm());
  };

  const handleSaveVoucher = async () => {
    if (editingVoucher) {
      showError("Voucher đã tạo không thể chỉnh sửa, hãy tạo voucher mới");
      return;
    }

    if (!form.code || !form.discount_value || !form.duration_hours || !form.usage_limit) {
      showError("Vui lòng nhập đầy đủ mã, mức giảm, thời hạn và số lượng");
      return;
    }

    const startDate = new Date(form.start_date);
    if (Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now()) {
      showError("Ngày bắt đầu phải từ thời điểm hiện tại trở đi");
      return;
    }

    setSaving(true);

    try {
      const res = await adminFetch("/admin/marketing/vouchers", {
        method: "POST",
        body: JSON.stringify(buildVoucherPayload(form)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showError(data?.message || "Lỗi khi lưu voucher");
        return;
      }

      success("Đã tạo voucher mới");
      closeModal();
      loadData();
    } catch {
      showError("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (voucher: Voucher) => {
    if (isVoucherLocked(voucher)) {
      showError("Voucher đã bị khóa, không thể chỉnh sửa hoặc xóa");
      return;
    }

    try {
      const res = await adminFetch(`/admin/marketing/vouchers/${voucher.voucher_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        showError("Không thể xóa voucher");
        return;
      }

      success("Đã xóa voucher thành công");
      setVouchers((current) =>
        current.filter((item) => item.voucher_id !== voucher.voucher_id),
      );
    } catch {
      showError("Lỗi kết nối");
    }
  };

  const handleStartDateChange = (datePart: string) => {
    const timePart = startTimeValue || minTime;
    setForm((current) => ({ ...current, start_date: `${datePart}T${timePart}` }));
  };

  const handleStartTimeChange = (timePart: string) => {
    const datePart = startDateValue || minDate;
    setForm((current) => ({ ...current, start_date: `${datePart}T${timePart}` }));
  };

  const columns = [
    {
      header: "Mã voucher",
      render: (voucher: Voucher) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <Tag size={18} />
          </div>
          <span className="font-bold uppercase tracking-wider text-slate-900">
            {voucher.code}
          </span>
        </div>
      ),
    },
    {
      header: "Mức giảm",
      render: (voucher: Voucher) => (
        <span className="font-bold text-blue-600">
          {voucher.discount_type === "percentage"
            ? `-${voucher.discount_value}%`
            : `-${formatVND(voucher.discount_value)}`}
        </span>
      ),
    },
    {
      header: "Đơn tối thiểu",
      render: (voucher: Voucher) => (
        <span className="font-medium italic text-slate-600">
          Từ {formatVND(voucher.min_order_value)}
        </span>
      ),
    },
    {
      header: "Đã dùng / GH",
      align: "center" as const,
      render: (voucher: Voucher) => (
        <span className="font-bold text-slate-700">
          {voucher.used_count} / {voucher.usage_limit}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (voucher: Voucher) =>
        isVoucherLocked(voucher) ? (
          <AdminStatusBadge tone="warning" icon={<Clock size={12} />}>
            Đã khóa
          </AdminStatusBadge>
        ) : voucher.status === 1 ? (
          <AdminStatusBadge tone="success" icon={<CheckCircle2 size={12} />}>
            Hoạt động
          </AdminStatusBadge>
        ) : (
          <AdminStatusBadge tone="muted" icon={<Clock size={12} />}>
            Tạm dừng
          </AdminStatusBadge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mã giảm giá (Vouchers)"
        description="Quản lý các chương trình ưu đãi nhập mã khuyến mãi."
        primaryAction={{ label: "Tạo mã mới", onClick: () => openVoucherModal() }}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm theo mã voucher..."
      />

      <VoucherStatusFilterTabs value={statusFilter} onChange={setStatusFilter} />

      <AdminTable
        items={filteredVouchers}
        columns={columns}
        loading={loading}
        rowKey={(voucher) => voucher.voucher_id}
        pageSize={10}
        itemLabel="voucher"
        onEdit={(voucher) => openVoucherModal(voucher)}
        onDelete={handleDeleteVoucher}
        emptyMessage="Không tìm thấy voucher nào phù hợp"
      />

      <VoucherModal
        open={showModal}
        saving={saving}
        readonly={isReadonlyVoucher}
        form={form}
        minDate={minDate}
        minTime={minTime}
        startDateValue={startDateValue}
        startTimeValue={startTimeValue}
        title={editingVoucher ? "Chi tiết voucher" : "Tạo voucher mới"}
        onClose={closeModal}
        onSave={handleSaveVoucher}
        onChange={(updater) => setForm((current) => updater(current))}
        onStartDateChange={handleStartDateChange}
        onStartTimeChange={handleStartTimeChange}
      />
    </div>
  );
}
