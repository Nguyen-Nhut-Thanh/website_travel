import HeroBanner from "../components/home/HeroBanner";
import SearchBar from "../components/home/SearchBar";
import { getPublicBanners } from "../lib/bannerApi";

export default async function HomePage() {
  const banners = await getPublicBanners();

  return (
    <main className="min-h-screen bg-white">
      <HeroBanner banners={banners} />
      <SearchBar />
    </main>
  );
}
