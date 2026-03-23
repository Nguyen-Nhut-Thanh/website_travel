export type BlogCategory = {
  category_id: number;
  name: string;
  slug: string;
};

export type BlogAuthor = {
  email?: string | null;
};

export type BlogPostSummary = {
  post_id: number;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnail?: string | null;
  created_at?: string | null;
  category?: BlogCategory | null;
};

export type BlogPostDetail = BlogPostSummary & {
  content?: string | null;
  author?: BlogAuthor | null;
};
