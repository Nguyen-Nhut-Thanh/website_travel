export type PostCategory = {
  category_id: number;
  name: string;
  description?: string | null;
  _count?: {
    posts?: number;
  };
};

export type PostItem = {
  post_id: number;
  title: string;
  summary: string | null;
  content: string;
  thumbnail: string | null;
  category_id: number;
  status: number;
  created_at?: string;
  slug?: string;
  category?: {
    name?: string | null;
  } | null;
};

export type PostEditorForm = {
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  category_id: string;
  status: number;
};

export type PostCategoryDraft = {
  name: string;
  description: string;
};

export function createDefaultPostEditorForm(): PostEditorForm {
  return {
    title: "",
    summary: "",
    content: "",
    thumbnail: "",
    category_id: "",
    status: 1,
  };
}

export function buildPostEditorForm(post: PostItem): PostEditorForm {
  return {
    title: post.title,
    summary: post.summary || "",
    content: post.content,
    thumbnail: post.thumbnail || "",
    category_id: String(post.category_id),
    status: post.status,
  };
}

export function matchesPostSearch(post: PostItem, search: string) {
  return post.title.toLowerCase().includes(search.trim().toLowerCase());
}

export function createDefaultPostCategoryDraft(): PostCategoryDraft {
  return {
    name: "",
    description: "",
  };
}
