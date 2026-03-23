"use client";

import { use, useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditorContent } from "@/components/admin/posts/PostEditorContent";
import { PostEditorSidebar } from "@/components/admin/posts/PostEditorSidebar";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import {
  buildPostEditorForm,
  createDefaultPostEditorForm,
  type PostCategory,
  type PostEditorForm,
  type PostItem,
} from "@/lib/admin/posts";

export default function AdminPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [form, setForm] = useState<PostEditorForm>(createDefaultPostEditorForm);

  useEffect(() => {
    const init = async () => {
      const categoryResponse = await adminFetch("/admin/post-categories");
      if (categoryResponse.ok) {
        setCategories(await categoryResponse.json());
      }

      if (!isNew) {
        try {
          const response = await adminFetch("/admin/posts");
          const posts: PostItem[] = await response.json();
          const post = posts.find((item) => item.post_id === Number(id));

          if (post) {
            setForm(buildPostEditorForm(post));
          }
        } catch {
          showError("Không thể tải thông tin bài viết");
        } finally {
          setLoading(false);
        }
      }
    };

    void init();
  }, [id, isNew, showError]);

  const handleSave = async () => {
    if (!form.title || !form.content || !form.category_id) {
      showError("Vui lòng điền đầy đủ tiêu đề, nội dung và danh mục");
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/admin/posts" : `/admin/posts/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(form),
      });

      if (response.ok) {
        success(isNew ? "Đã đăng bài viết mới" : "Đã cập nhật bài viết");
        router.push("/admin/marketing/posts");
      } else {
        showError("Lỗi khi lưu bài viết");
      }
    } catch {
      showError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <AdminPageHeader
          title={isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
          description="Tạo nội dung thu hút để tiếp cận nhiều khách hàng hơn."
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PostEditorContent form={form} onFormChange={setForm} />
        </div>

        <PostEditorSidebar
          isNew={isNew}
          saving={saving}
          categories={categories}
          form={form}
          onSave={handleSave}
          onCancel={() => router.push("/admin/marketing/posts")}
          onFormChange={setForm}
        />
      </div>
    </div>
  );
}
