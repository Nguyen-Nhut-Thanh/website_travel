"use client";

import { use, useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostEditorContent } from "@/components/admin/posts/PostEditorContent";
import { PostEditorSidebar } from "@/components/admin/posts/PostEditorSidebar";
import { useToast } from "@/components/common/Toast";
import {
  buildPostEditorForm,
  createDefaultPostEditorForm,
  type PostCategory,
  type PostEditorForm,
  type PostItem,
} from "@/lib/admin/posts";
import {
  getAdminPostCategories,
  getAdminPosts,
  saveAdminPost,
} from "@/lib/admin/postsApi";

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
      setCategories(await getAdminPostCategories());

      if (!isNew) {
        try {
          const posts = await getAdminPosts();
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

      await saveAdminPost(url, method, form);
      success(isNew ? "Đã đăng bài viết mới" : "Đã cập nhật bài viết");
      router.push("/admin/marketing/posts");
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
