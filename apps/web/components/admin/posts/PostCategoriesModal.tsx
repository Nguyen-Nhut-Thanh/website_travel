"use client";

import { Loader2, Save, Tag } from "lucide-react";
import { AdminModalShell } from "@/components/admin/AdminModalShell";
import type { PostCategory, PostCategoryDraft } from "@/lib/admin/posts";

type Props = {
  open: boolean;
  categories: PostCategory[];
  newCategory: PostCategoryDraft;
  saving: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDraftChange: (draft: PostCategoryDraft) => void;
};

export function PostCategoriesModal({
  open,
  categories,
  newCategory,
  saving,
  onClose,
  onCreate,
  onDraftChange,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <AdminModalShell
      title="Danh mục bài viết"
      icon={<Tag size={20} />}
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <div className="space-y-6 p-6">
        <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Thêm danh mục mới
          </p>
          <input
            type="text"
            placeholder="Tên danh mục (VD: Kinh nghiệm du lịch)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            value={newCategory.name}
            onChange={(event) =>
              onDraftChange({ ...newCategory, name: event.target.value })
            }
          />
          <button
            onClick={onCreate}
            disabled={saving || !newCategory.name}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Lưu danh mục
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Danh sách hiện có
          </p>
          <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-2">
            {categories.map((category) => (
              <div
                key={category.category_id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">{category.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {category._count?.posts || 0} bài viết
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminModalShell>
  );
}
