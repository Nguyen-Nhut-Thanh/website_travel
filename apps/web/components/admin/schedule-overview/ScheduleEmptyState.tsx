"use client";

import { CalendarDays } from "lucide-react";

export function ScheduleEmptyState() {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-[40px] border border-dashed border-slate-200 bg-white text-slate-400 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
        <CalendarDays size={32} className="text-slate-200" />
      </div>
      <p className="text-sm font-medium">Vui lòng chọn một tour để quản lý lịch trình</p>
    </div>
  );
}
