"use client";

import { CheckCircle2, Layers } from "lucide-react";
import { LOCATION_LEVEL_DESCRIPTIONS, LOCATION_LEVEL_LABELS, type LocationDetailForm } from "@/lib/admin/locationDetail";

type Props = {
  form: LocationDetailForm;
  onLevelChange: (level: number) => void;
};

export function LocationLevelSelector({ form, onLevelChange }: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
            <Layers size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Chọn cấp địa điểm quản lý</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bắt buộc</span>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((level) => {
            const isDisabled = level < 3;
            const isSelected = form.level_id === level;

            return (
              <button
                key={level}
                type="button"
                disabled={isDisabled}
                onClick={() => onLevelChange(level)}
                className={`group flex items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                  isDisabled
                    ? "cursor-not-allowed border-slate-50 bg-slate-50 opacity-40"
                    : isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-md shadow-blue-50"
                      : "border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {level}
                  </div>
                  <div className="text-left">
                    <h4 className={`text-sm font-bold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {LOCATION_LEVEL_LABELS[level]}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-500">
                      {isDisabled ? "Cấp độ gốc, không thể tạo" : LOCATION_LEVEL_DESCRIPTIONS[level]}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? "scale-110 border-blue-600 bg-blue-600 text-white" : "border-slate-200"
                  }`}
                >
                  {isSelected && <CheckCircle2 size={12} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
