"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getPublicBlogCategories, getPublicBlogPosts } from "@/lib/blogApi";
import { formatDate } from "@/lib/utils";
import type { BlogCategory, BlogPostSummary } from "@/types/blog";

function ArticleRow({ post }: { post: BlogPostSummary }) {
  return (
    <article className="border-b border-[#ded7cc] py-8 first:pt-0 last:border-b-0">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-5 md:grid-cols-[236px_minmax(0,1fr)] md:items-start"
      >
        <div className="relative overflow-hidden rounded-[6px] bg-[#ebe7e0]">
          <ImageWithFallback
            src={post.thumbnail || undefined}
            alt={post.title}
            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[24px] font-bold leading-[1.25] tracking-[-0.03em] text-slate-900 transition-colors group-hover:text-[#0f5cab] md:text-[27px]">
            {post.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-[16px] leading-8 text-slate-600">
            {post.summary ||
              "Khám phá những ghi chép mới, kinh nghiệm thực tế và góc nhìn du lịch đáng lưu lại từ Travol."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {formatDate(post.created_at)}
            </span>
            <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f5cab]">
              {post.category?.name || "Travol"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [postsData, categoriesData] = await Promise.all([
          getPublicBlogPosts(activeCategory),
          getPublicBlogCategories(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      } catch {
        setPosts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf7ff_0%,#f4faff_18%,#f8fcff_42%,#eef6ff_100%)]">
      <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:px-6 sm:pb-8 sm:pt-7 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,92,171,0.10),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link href="/" className="transition hover:text-[#0f5cab]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-slate-800">Bài viết</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <span className="inline-flex rounded-full border border-[#cfe1f0] bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.26em] text-[#0f5cab] backdrop-blur">
              Tạp chí Travol
            </span>
            <h1 className="max-w-4xl text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#111827] md:text-[52px]">
              Câu chuyện đường đi, góc nhìn trải nghiệm và cảm hứng lên đường.
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-slate-600 md:text-[17px]">
              Một không gian nội dung thiên về trải nghiệm thực tế: lịch trình đáng thử, bí kíp chuẩn bị,
              điểm đến đang lên và những ghi chép đủ chiều sâu để bạn chọn chuyến đi kế tiếp.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                !activeCategory
                  ? "bg-[#111827] text-white shadow-[0_14px_34px_rgba(15,23,42,0.18)]"
                  : "border border-[#d8dde7] bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Tất cả bài viết
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                  activeCategory === category.slug
                    ? "bg-[#0f5cab] text-white shadow-[0_14px_34px_rgba(15,92,171,0.22)]"
                    : "border border-[#d8dde7] bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl px-0 py-4 sm:px-0 md:px-0">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="grid gap-5 border-b border-[#ded7cc] pb-8 md:grid-cols-[236px_minmax(0,1fr)]"
                >
                  <div className="aspect-[16/10] animate-pulse rounded-[6px] bg-slate-200" />
                  <div className="space-y-4">
                    <div className="h-8 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-5 w-5/6 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-slate-500">
                Chưa có bài viết nào trong mục này.
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <ArticleRow key={post.post_id} post={post} />
              ))}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#0f5cab] hover:text-[#0f5cab]"
              >
                Xem thêm bài viết
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
