export type AdminLocationLevel = {
  level_id: number;
  name: string;
};

export type AdminLocationImage = {
  image_url?: string | null;
};

export type AdminLocationItem = {
  location_id: number;
  name: string;
  parent_id?: number | null;
  level_id: number;
  country_code?: string | null;
  is_featured?: boolean | null;
  featured_order?: number | null;
  featured_image?: string | null;
  geographic_levels?: AdminLocationLevel | null;
  location_images?: AdminLocationImage[] | null;
  usage_summary?: {
    child_locations_count: number;
    destination_tours_count: number;
    departure_tours_count: number;
    hotel_count: number;
    destination_detail_count: number;
    is_used_in_tours: boolean;
    has_children: boolean;
    has_dependencies: boolean;
    can_delete: boolean;
    can_change_structure: boolean;
  } | null;
};
