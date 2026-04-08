"use client";

import Image from "next/image";
import { Camera, Info, Loader2, X } from "lucide-react";
import type { LocationDetailForm } from "@/lib/admin/locationDetail";

type Props = {
  form: LocationDetailForm;
  uploading: boolean;
  saving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFormChange: (
    updater: (prev: LocationDetailForm) => LocationDetailForm,
  ) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function LocationImageSidebar({
  form,
  uploading,
  saving,
  fileInputRef,
  onFormChange,
  onFileUpload,
  onCancel,
  onSave,
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
        <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-3">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border-4 border-dashed transition-all ${
              form.image_url
                ? "border-transparent ring-2 ring-slate-100"
                : "border-slate-100 bg-slate-50 hover:border-blue-300 hover:bg-slate-100"
            }`}
          >
            {form.image_url ? (
              <>
                <Image
                  src={form.image_url}
                  alt="Location"
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                <span className="text-xs font-black text-slate-500">
                  Tải ảnh lên
                </span>
                <p className="mt-1 text-[10px] text-slate-400">
                  Hỗ trợ JPG, PNG, WebP
                </p>
              </>
            )}
          </div>
        </div>

        {form.image_url && (
          <button
            type="button"
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

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Lưu địa điểm
          </button>
        </div>
      </div>
    </div>
  );
}
