export type PostCategoryPayload = {
  name: string;
  description?: string;
};

export type PostAdminQuery = {
  category_id?: number;
  search?: string;
};

export type PostPayload = {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  thumbnail?: string;
  category_id?: number | string;
  status?: number | string;
};
