export type FeaturedDestinationItem = {
  location_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  alt_text: string;
  total_tours: number;
};

export type FeaturedDestinationGroup = {
  key: string;
  label: string;
  items: FeaturedDestinationItem[];
};

export type FeaturedDestinationsResponse = {
  regions: FeaturedDestinationGroup[];
};
