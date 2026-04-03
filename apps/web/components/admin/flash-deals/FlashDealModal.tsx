"use client";

import { Clock, Loader2, Percent, Save, Zap } from "lucide-react";
import { AdminModalShell } from "@/components/admin/AdminModalShell";
import { PriceInput } from "@/components/admin/PriceInput";
import {
  FlashDealForm,
  FlashDealSchedule,
  previewFlashDealPrice,
} from "@/lib/admin/flashDeals";
import { formatVND } from "@/lib/utils";

type FlashDealModalProps = {
  open: boolean;
  saving: boolean;
  schedule: FlashDealSchedule | null;
  form: FlashDealForm;
  onClose: () => void;
  onChange: (updater: (current: FlashDealForm) => FlashDealForm) => void;
  onSave: () => void;
};

export function FlashDealModal({
  open,
  saving,
  schedule,
  form,
  onClose,
  onChange,
  onSave,
}: FlashDealModalProps) {
  if (!open) {
    return null;
  }

  return (
    <AdminModalShell
      title="Thiết lập Flash Deal"
      icon={<Zap size={20} fill="currentColor" />}
      onClose={onClose}
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
            disabled={saving}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu deal
          </button>
        </>
      }
    >
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Loại ưu đãi
              </label>
              <div className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1">
                <button
                  onClick={() =>
                    onChange((current) => ({ ...current, discount_type: "percentage" }))
                  }
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    form.discount_type === "percentage"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Phần trăm (%)
                </button>
                <button
                  onClick={() =>
                    onChange((current) => ({ ...current, discount_type: "fixed_amount" }))
                  }
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    form.discount_type === "fixed_amount"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Số tiền (VND)
                </button>
              </div>
            </div>

            {form.discount_type === "percentage" ? (
              <PriceInput
                label="Mức giảm (%)"
                value={form.discount_value}
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
                onChange={(value) =>
                  onChange((current) => ({ ...current, discount_value: value }))
                }
                placeholder="500,000"
              />
            )}
          </div>

          <div className="h-full pt-6">
            <div className="flex h-full flex-col justify-center space-y-3 rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Kích hoạt deal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={form.hours_before}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        hours_before: Number(event.target.value),
                      }))
                    }
                  />
                  <span className="text-xs font-bold text-slate-400">giờ</span>
                </div>
              </div>
              <p className="text-center text-[10px] font-medium italic leading-tight text-blue-500">
                Bật trước khởi hành {Math.floor(form.hours_before / 24)} ngày{" "}
                {form.hours_before % 24}h.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
          <div className="flex flex-col justify-center rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Giá bán gốc
            </span>
            <span className="text-xl font-bold italic tracking-tight text-slate-900">
              {formatVND(Number(schedule?.price))}
            </span>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Giá sau giảm
            </span>
            <span className="text-xl font-black italic tracking-tighter text-emerald-700">
              {formatVND(
                previewFlashDealPrice(
                  Number(schedule?.price),
                  form.discount_type,
                  form.discount_value,
                ),
              )}
            </span>
          </div>
        </div>
      </div>
    </AdminModalShell>
  );
}
