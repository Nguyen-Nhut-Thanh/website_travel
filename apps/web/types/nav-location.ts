export interface NavLocationData {
  domestic: {
    region: string;
    cities: { name: string; slug: string }[];
  }[];
  international: { name: string; slug: string }[];
}
