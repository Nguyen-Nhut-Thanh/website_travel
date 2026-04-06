"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, FolderOpen, Loader2, Share2, User } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getPublicBlogPostDetail } from "@/lib/blogApi";
import { formatDate } from "@/lib/utils";
import type { BlogPostDetail } from "@/types/blog";

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      {icon}
      <span>{children}</span>
    </div>
  );
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLabel, setShareLabel] = useState("Chia sẻ");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getPublicBlogPostDetail(slug);
        setPost(data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    void loadPost();
  }, [slug]);

  const authorName = useMemo(() => {
    return (post?.author?.email || "travol").split("@")[0];
  }, [post?.author?.email]);

  const handleShare = async () => {
    const shareData = {
      title: post?.title || "Bài viết Travol",
      text: post?.summary || "Xem bài viết này trên Travol.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Đã sao chép");
        window.setTimeout(() => setShareLabel("Chia sẻ"), 2000);
      }
    } catch {
      // Người dùng hủy chia sẻ hoặc môi trường hiện tại không cho phép.
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#edf7ff_0%,#f4faff_18%,#f8fcff_42%,#eef6ff_100%)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0f5cab]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#edf7ff_0%,#f4faff_18%,#f8fcff_42%,#eef6ff_100%)] px-4 text-center">
        <div className="rounded-[28px] border border-[#d9e6f3] bg-white px-8 py-14 shadow-[0_18px_55px_rgba(15,23,42,0.04)]">
          <p className="text-xl font-black text-slate-900">Không tìm thấy bài viết</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf7ff_0%,#f4faff_18%,#f8fcff_42%,#eef6ff_100%)] pb-20">
      <section className="px-4 pb-16 pt-6 sm:px-6 sm:pt-7 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link href="/" className="transition hover:text-[#0f5cab]">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/blog" className="transition hover:text-[#0f5cab]">
              Bài viết
            </Link>
            <span>/</span>
            <span className="truncate text-slate-800">{post.title}</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)_240px] xl:items-start">
            <aside className="xl:sticky xl:top-24">
              <div className="overflow-hidden rounded-[12px] border border-[#d9e6f3] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <ImageWithFallback
                  src={post.thumbnail || undefined}
                  alt={post.title}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </aside>

            <article className="min-w-0">
              <div className="rounded-[12px] border border-[#d9e6f3] bg-white/94 px-6 py-7 shadow-[0_20px_75px_rgba(15,23,42,0.05)] sm:px-8 lg:px-10">
                <span className="inline-flex rounded-full border border-[#cfe1f0] bg-[#f3f8fd] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0f5cab]">
                  {post.category?.name || "Travol"}
                </span>

                <h1 className="mt-5 text-[34px] font-black leading-[0.98] tracking-[-0.05em] text-[#111827] md:text-[52px]">
                  {post.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#e2edf7] pt-5">
                  <MetaItem icon={<Calendar className="h-4 w-4 text-[#0f5cab]" />}>
                    {formatDate(post.created_at)}
                  </MetaItem>
                  <MetaItem icon={<User className="h-4 w-4 text-slate-400" />}>
                    {authorName}
                  </MetaItem>
                </div>

                <div
                  className="prose prose-slate mt-8 max-w-none prose-headings:font-black prose-headings:tracking-[-0.03em] prose-h2:mt-12 prose-h2:text-[30px] prose-h2:text-slate-900 prose-h3:text-[23px] prose-h3:text-slate-900 prose-p:text-[17px] prose-p:leading-8 prose-p:text-slate-700 prose-a:text-[#0f5cab] prose-strong:text-slate-900 prose-li:text-[16px] prose-li:leading-8 prose-blockquote:border-l-[#0f5cab] prose-blockquote:bg-[#f3f8fd] prose-blockquote:px-6 prose-blockquote:py-3 prose-blockquote:font-medium"
                  dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />
              </div>
            </article>

            <aside className="xl:sticky xl:top-24">
              <div className="rounded-[12px] border border-[#d9e6f3] bg-white/92 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Thông tin bài viết
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-[#f3f8fd] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Ngày đăng
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{formatDate(post.created_at)}</p>
                  </div>

                  <div className="rounded-xl bg-[#f3f8fd] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Chuyên mục
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FolderOpen className="h-4 w-4 text-[#0f5cab]" />
                      {post.category?.name || "Travol"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f3f8fd] px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Tác giả
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <User className="h-4 w-4 text-[#0f5cab]" />
                      {authorName}
                    </p>
                  </div>

                  <button
                    onClick={handleShare}
                    className="flex w-full items-center justify-between rounded-xl bg-[#111827] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f5cab]"
                  >
                    <span className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      {shareLabel}
                    </span>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
