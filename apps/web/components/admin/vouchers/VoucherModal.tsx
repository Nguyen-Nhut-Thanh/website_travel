"use client";

import {
  Calendar,
  Clock,
  Hash,
  Loader2,
  Percent,
  Save,
  Ticket,
} from "lucide-react";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import { AdminModalShell } from "@/components/admin/AdminModalShell";
import { PriceInput } from "@/components/admin/PriceInput";
import { VoucherForm } from "@/lib/admin/vouchers";

type VoucherModalProps = {
  open: boolean;
  saving: boolean;
  readonly: boolean;
  form: VoucherForm;
  minDate: string;
  minTime: string;
  startDateValue: string;
  startTimeValue: string;
  title: string;
  onClose: () => void;
  onSave: () => void;
  onChange: (updater: (current: VoucherForm) => VoucherForm) => void;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
};

export function VoucherModal({
  open,
  saving,
  readonly,
  form,
  minDate,
  minTime,
  startDateValue,
  startTimeValue,
  title,
  onClose,
  onSave,
  onChange,
  onStartDateChange,
  onStartTimeChange,
}: VoucherModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AdminModalShell
      title={title}
      icon={<Ticket size={20} />}
      onClose={onClose}
      maxWidthClassName="max-w-[850px]"
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSave}
            disabled={saving || readonly}
            title={readonly ? "Voucher đã tạo chỉ có thể xem lại" : undefined}
            className={`flex flex-[2] items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-all ${
              readonly ? "cursor-not-allowed bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-80`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {readonly ? "Không thể chỉnh sửa" : "Lưu voucher"}
          </button>
        </>
      }
    >
      <fieldset
        disabled={readonly}
        className="space-y-4 p-4 disabled:cursor-not-allowed disabled:opacity-75"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="flex flex-col justify-start space-y-5 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mã voucher
                </label>
                <input
                  type="text"
                  disabled={readonly}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold uppercase text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
                  placeholder="VD: GIAMHE20"
                  value={form.code}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Trạng thái
                </label>
                <select
                  disabled={readonly}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white"
                  value={form.status}
                  onChange={(event) =>
                    onChange((current) => ({
                      ...current,
                      status: Number(event.target.value),
                    }))
                  }
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Tạm dừng</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Loại ưu đãi
              </label>
              <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() =>
                    onChange((current) => ({ ...current, discount_type: "percentage" }))
                  }
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    form.discount_type === "percentage"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Phần trăm (%)
                </button>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() =>
                    onChange((current) => ({ ...current, discount_type: "fixed_amount" }))
                  }
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    form.discount_type === "fixed_amount"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Số tiền (VND)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-2">
                  <div className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Calendar size={16} className="text-blue-600" />
                    Ngày bắt đầu
                  </div>
                  <div className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Giờ bắt đầu
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_170px] items-start gap-2">
                  <AdminDatePicker
                    value={startDateValue}
                    minDate={minDate}
                    disabled={readonly}
                    onChange={onStartDateChange}
                  />

                  <div className="flex min-h-[64px] flex-col justify-center rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                    <input
                      type="time"
                      min={startDateValue === minDate ? minTime : undefined}
                      step={300}
                      disabled={readonly}
                      className="w-full border-0 bg-transparent p-0 text-sm font-bold text-slate-800 outline-none focus:ring-0 disabled:cursor-not-allowed"
                      value={startTimeValue}
                      onChange={(event) => onStartTimeChange(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Clock size={16} className="text-blue-600" />
                    Hết hạn (giờ)
                  </label>
                  <input
                    type="number"
                    disabled={readonly}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.duration_hours}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        duration_hours: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Hash size={16} className="text-blue-600" />
                    Số lượng
                  </label>
                  <input
                    type="number"
                    disabled={readonly}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.usage_limit}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        usage_limit: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 border-t border-slate-50 pt-1">
          {form.discount_type === "percentage" ? (
            <PriceInput
              label="Mức giảm (%)"
              value={form.discount_value}
              disabled={readonly}
              onChange={(value) =>
                onChange((current) => ({ ...current, discount_value: value }))
              }
              placeholder="10"
              suffix="%"
              icon={Percent}
            />
          ) : (
            <PriceInput
              label="Mức giảm (VND)"
              value={form.discount_value}
              disabled={readonly}
              onChange={(value) =>
                onChange((current) => ({ ...current, discount_value: value }))
              }
              placeholder="50,000"
            />
          )}

          <PriceInput
            label="Đơn tối thiểu"
            value={form.min_order_value}
            disabled={readonly}
            onChange={(value) =>
              onChange((current) => ({ ...current, min_order_value: value }))
            }
            placeholder="0"
          />
        </div>
      </fieldset>
    </AdminModalShell>
  );
}
