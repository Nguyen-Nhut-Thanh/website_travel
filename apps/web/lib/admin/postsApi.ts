import { adminFetch } from "@/lib/adminFetch";
import type { PostCategory, PostCategoryDraft, PostItem } from "@/lib/admin/posts";

async function requestAdminPosts<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await adminFetch(path, init);
  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data as T;
}

export function getAdminPosts() {
  return requestAdminPosts<PostItem[]>(
    "/admin/posts",
    { method: "GET" },
    "Không thể tải danh sách bài viết.",
  );
}

export function getAdminPostCategories() {
  return requestAdminPosts<PostCategory[]>(
    "/admin/post-categories",
    { method: "GET" },
    "Không thể tải danh mục bài viết.",
  );
}

export function createAdminPostCategory(body: PostCategoryDraft) {
  return requestAdminPosts(
    "/admin/post-categories",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể thêm danh mục.",
  );
}

export function deleteAdminPost(postId: number) {
  return requestAdminPosts(
    `/admin/posts/${postId}`,
    { method: "DELETE" },
    "Không thể xóa bài viết.",
  );
}

export function saveAdminPost(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
) {
  return requestAdminPosts(
    path,
    {
      method,
      body: JSON.stringify(body),
    },
    "Không thể lưu bài viết.",
  );
}
