"use client";

import { AlignLeft, Type } from "lucide-react";
import type { PostEditorForm } from "@/lib/admin/posts";

type Props = {
  form: PostEditorForm;
  onFormChange: (updater: (prev: PostEditorForm) => PostEditorForm) => void;
};

export function PostEditorContent({ form, onFormChange }: Props) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Tiêu đề bài viết
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ví dụ: Kinh nghiệm du lịch Đà Lạt tự túc 2026"
            value={form.title}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Tóm tắt ngắn
        </label>
        <div className="relative">
          <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
          <textarea
            className="min-h-[100px] w-full resize-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Mô tả ngắn gọn về bài viết (hiển thị ở trang danh sách)..."
            value={form.summary}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, summary: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Nội dung chi tiết
        </label>
        <textarea
          className="min-h-[400px] w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Viết nội dung bài viết ở đây..."
          value={form.content}
          onChange={(event) =>
            onFormChange((prev) => ({ ...prev, content: event.target.value }))
          }
        />
        <p className="mt-1 text-[10px] italic text-slate-400">* Hỗ trợ định dạng văn bản cơ bản.</p>
      </div>
    </div>
  );
}
