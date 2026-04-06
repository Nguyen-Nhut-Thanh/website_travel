export type LocationListParams = {
  search?: string;
  level_id?: string;
};

export type LocationAdminPayload = {
  name?: string;
  slug?: string;
  location_type?: string;
  level_id?: number | string;
  parent_id?: number | string | null;
  country_code?: string | null;
  note?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  featured_order?: number | string | null;
  featured_image?: string | null;
};
