"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Edit,
  ExternalLink,
  FileText,
  Plus,
  Settings2,
  Tag,
  Trash2,
} from "lucide-react";
import { AdminIconActionButton } from "@/components/admin/AdminIconActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminTable } from "@/components/admin/AdminTable";
import { PostCategoriesModal } from "@/components/admin/posts/PostCategoriesModal";
import { useToast } from "@/components/common/Toast";
import { confirmAction } from "@/lib/admin/confirm";
import {
  createDefaultPostCategoryDraft,
  matchesPostSearch,
  PostCategory,
  PostCategoryDraft,
  PostItem,
} from "@/lib/admin/posts";
import {
  createAdminPostCategory,
  deleteAdminPost,
  getAdminPostCategories,
  getAdminPosts,
} from "@/lib/admin/postsApi";

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<PostCategoryDraft>(
    createDefaultPostCategoryDraft,
  );
  const [savingCategory, setSavingCategory] = useState(false);

  const { success, error: showError } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [postsData, categoriesData] = await Promise.all([
        getAdminPosts(),
        getAdminPostCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch {
      showError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredPosts = useMemo(
    () => posts.filter((post) => matchesPostSearch(post, searchTerm)),
    [posts, searchTerm],
  );

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      return;
    }

    setSavingCategory(true);

    try {
      await createAdminPostCategory(newCategory);
      success("Đã thêm danh mục mới");
      setNewCategory(createDefaultPostCategoryDraft());
      void loadData();
    } catch {
      showError("Lỗi khi thêm danh mục");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirmAction("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      await deleteAdminPost(postId);
      success("Đã xóa bài viết");
      void loadData();
    } catch {
      showError("Lỗi khi xóa");
    }
  };

  const columns = [
    {
      header: "STT",
      render: (_: PostItem, index: number) => (
        <span className="font-medium text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      ),
    },
    {
      header: "Bài viết",
      render: (post: PostItem) => (
        <div className="flex items-center gap-4">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              className="h-10 w-16 rounded-lg object-cover shadow-sm"
              alt=""
            />
          ) : (
            <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <FileText size={16} />
            </div>
          )}
          <div className="space-y-0.5">
            <p className="line-clamp-1 font-bold text-slate-900">{post.title}</p>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-400">
              <span className="flex items-center gap-1">
                <Tag size={12} /> {post.category?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {post.created_at ? new Date(post.created_at).toLocaleDateString("vi-VN") : "---"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (post: PostItem) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
            post.status === 1
              ? "border-green-100 bg-green-50 text-green-600"
              : "border-slate-100 bg-slate-50 text-slate-400"
          }`}
        >
          {post.status === 1 ? "Công khai" : "Nháp"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      align: "right" as const,
      render: (post: PostItem) => (
        <div className="flex items-center justify-end gap-2">
          <AdminIconActionButton
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            icon={<ExternalLink size={16} />}
            title="Xem bài viết"
          />
          <AdminIconActionButton
            onClick={() => router.push(`/admin/marketing/posts/${post.post_id}`)}
            icon={<Edit size={16} />}
            title="Chỉnh sửa"
            tone="primary"
          />
          <AdminIconActionButton
            onClick={() => handleDelete(post.post_id)}
            icon={<Trash2 size={16} />}
            title="Xóa"
            tone="danger"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Bài viết"
        description="Viết và quản lý các bài viết tin tức, cẩm nang du lịch."
        actions={
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <Settings2 size={18} /> Danh mục
          </button>
        }
        primaryAction={{
          label: "Viết bài mới",
          onClick: () => router.push("/admin/marketing/posts/new"),
          icon: <Plus size={18} />,
        }}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm tiêu đề bài viết..."
      />

      <AdminTable
        items={filteredPosts}
        columns={columns}
        loading={loading}
        rowKey={(post) => post.post_id}
        emptyMessage="Chưa có bài viết nào"
      />

      <PostCategoriesModal
        open={showCategoryModal}
        categories={categories}
        newCategory={newCategory}
        saving={savingCategory}
        onClose={() => setShowCategoryModal(false)}
        onCreate={handleCreateCategory}
        onDraftChange={setNewCategory}
      />
    </div>
  );
}
