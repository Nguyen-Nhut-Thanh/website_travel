import { publicFetch } from "@/lib/publicFetch";
import type { BlogCategory, BlogPostDetail, BlogPostSummary } from "@/types/blog";

export async function getPublicBlogPosts(category?: string | null) {
  const query = category ? `?category=${category}` : "";
  return publicFetch<BlogPostSummary[]>(`/public/posts${query}`);
}

export async function getPublicBlogCategories() {
  return publicFetch<BlogCategory[]>("/public/posts/categories");
}

export async function getPublicBlogPostDetail(slug: string) {
  return publicFetch<BlogPostDetail>(`/public/posts/${slug}`);
}
