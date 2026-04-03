"use client";

import { Camera, Clock, Info, Loader2, Save, Upload } from "lucide-react";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import type { ScheduleFormState } from "@/lib/admin/scheduleEditor";

type Props = {
  form: ScheduleFormState;
  isPast: boolean;
  saving: boolean;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSave: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (updater: (prev: ScheduleFormState) => ScheduleFormState) => void;
};

export function ScheduleSidebar({
  form,
  isPast,
  saving,
  uploading,
  fileInputRef,
  onSave,
  onFileUpload,
  onFormChange,
}: Props) {
  return (
    <div className="space-y-8">
      <AdminFormCard
        title="Ảnh đại diện"
        icon={
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isPast ? "bg-slate-50 text-slate-300" : "bg-amber-50 text-amber-600"
            }`}
          >
            <Camera size={18} />
          </div>
        }
        bodyClassName="p-6"
      >
        <div
          onClick={() => !uploading && !isPast && fileInputRef.current?.click()}
          className={`relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
            form.cover_image_url
              ? "border-transparent"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          } ${isPast ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
        >
          {form.cover_image_url ? (
            <img
              src={form.cover_image_url}
              className="h-full w-full object-cover"
              alt="Schedule cover"
            />
          ) : (
            <>
              {uploading ? (
                <Loader2 className="animate-spin text-blue-600" />
              ) : (
                <Upload className="text-slate-300" size={32} />
              )}
              <span className="mt-2 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Tải ảnh đại diện cho đợt này
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept="image/*"
          className="hidden"
        />
      </AdminFormCard>

      <AdminFormCard bodyClassName="space-y-6 p-6">
        <div className="space-y-4">
          <h3
            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${
              isPast ? "text-slate-300" : "text-blue-600"
            }`}
          >
            <Clock size={16} /> Quản lý trạng thái
          </h3>
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Trạng thái đợt tour
            </label>
            <select
              disabled={isPast}
              className={`w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                isPast ? "cursor-not-allowed text-slate-400" : ""
              }`}
              value={form.status}
              onChange={(event) =>
                onFormChange((prev) => ({ ...prev, status: Number(event.target.value) }))
              }
            >
              <option value={1}>Đang hoạt động</option>
              <option value={0}>Tạm khóa / Hết chỗ</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ghi chú nội bộ
            </label>
            <textarea
              disabled={isPast}
              className={`min-h-[100px] w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                isPast ? "cursor-not-allowed text-slate-300" : ""
              }`}
              placeholder="Thông tin ghi chú nội bộ dành cho nhân viên..."
              value={form.note || ""}
              onChange={(event) =>
                onFormChange((prev) => ({ ...prev, note: event.target.value }))
              }
            />
          </div>
        </div>
      </AdminFormCard>

      {!isPast && (
        <button
          onClick={onSave}
          disabled={saving}
          className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          <span>Lưu lịch trình ngay</span>
        </button>
      )}

      {isPast && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-400">
          <Info size={20} />
          <p className="text-xs font-bold leading-tight">
            Lịch khởi hành này đã diễn ra. Bạn chỉ có thể xem lại dữ liệu.
          </p>
        </div>
      )}
    </div>
  );
}
