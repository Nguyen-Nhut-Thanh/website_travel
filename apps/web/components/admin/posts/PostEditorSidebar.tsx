"use client";

import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { PostCategory, PostEditorForm } from "@/lib/admin/posts";

type Props = {
  isNew: boolean;
  saving: boolean;
  categories: PostCategory[];
  form: PostEditorForm;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (updater: (prev: PostEditorForm) => PostEditorForm) => void;
};

export function PostEditorSidebar({
  isNew,
  saving,
  categories,
  form,
  onSave,
  onCancel,
  onFormChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Ảnh đại diện
        </label>
        <ImageUpload
          value={form.thumbnail}
          onChange={(url) =>
            onFormChange((prev) => ({
              ...prev,
              thumbnail: Array.isArray(url) ? url[0] || "" : url,
            }))
          }
        />
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Danh mục
          </label>
          <select
            className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={form.category_id}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, category_id: event.target.value }))
            }
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Trạng thái
          </label>
          <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1">
            <button
              onClick={() => onFormChange((prev) => ({ ...prev, status: 1 }))}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                form.status === 1 ? "bg-white text-green-600 shadow-sm" : "text-slate-400"
              }`}
            >
              Công khai
            </button>
            <button
              onClick={() => onFormChange((prev) => ({ ...prev, status: 0 }))}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                form.status === 0 ? "bg-white text-slate-600 shadow-sm" : "text-slate-400"
              }`}
            >
              Bản nháp
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isNew ? "Đăng bài viết" : "Lưu thay đổi"}
        </button>
        <button
          onClick={onCancel}
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
}
