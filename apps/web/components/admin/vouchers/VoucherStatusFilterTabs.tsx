"use client";

import { VoucherStatusFilter } from "@/lib/admin/vouchers";

type VoucherStatusFilterTabsProps = {
  value: VoucherStatusFilter;
  onChange: (value: VoucherStatusFilter) => void;
};

export function VoucherStatusFilterTabs({
  value,
  onChange,
}: VoucherStatusFilterTabsProps) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
      <button
        onClick={() => onChange("all")}
        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
          value === "all" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Tất cả
      </button>
      <button
        onClick={() => onChange("active")}
        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
          value === "active"
            ? "bg-emerald-600 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Đang hoạt động
      </button>
      <button
        onClick={() => onChange("expired")}
        className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
          value === "expired"
            ? "bg-amber-500 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Hết hạn
      </button>
    </div>
  );
}
