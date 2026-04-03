"use client";

import { Camera, Info, Loader2, X } from "lucide-react";
import type { LocationDetailForm } from "@/lib/admin/locationDetail";

type Props = {
  form: LocationDetailForm;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFormChange: (updater: (prev: LocationDetailForm) => LocationDetailForm) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function LocationImageSidebar({
  form,
  uploading,
  fileInputRef,
  onFormChange,
  onFileUpload,
}: Props) {
  return (
    <div className="sticky top-8 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
          <Camera size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Hình ảnh bìa</h3>
      </div>
      <div className="p-8">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border-4 border-dashed transition-all ${
            form.image_url
              ? "border-transparent ring-2 ring-slate-100"
              : "border-slate-100 bg-slate-50 hover:border-blue-300 hover:bg-slate-100"
          }`}
        >
          {form.image_url ? (
            <>
              <img
                src={form.image_url}
                alt="Location"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-2xl border border-white/30 bg-white/20 p-4 text-xs font-black text-white backdrop-blur-md">
                  Thay đổi hình ảnh
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm transition-transform group-hover:scale-110">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                ) : (
                  <Camera className="text-slate-400" size={32} />
                )}
              </div>
              <span className="text-xs font-black text-slate-500">Tải ảnh lên</span>
              <p className="mt-1 text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WebP</p>
            </>
          )}
        </div>

        {form.image_url && (
          <button
            onClick={() => onFormChange((prev) => ({ ...prev, image_url: "" }))}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 py-4 text-xs font-black text-rose-500 transition-all hover:bg-rose-100"
          >
            <X size={14} /> Gỡ bỏ hình ảnh hiện tại
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-black text-slate-900">
            <Info size={16} className="text-blue-500" /> Mẹo nhỏ
          </div>
          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
            Sử dụng hình ảnh có độ phân giải cao (ít nhất 1200x800px) và dung lượng dưới 2MB để đảm bảo tốc độ tải trang tốt nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
