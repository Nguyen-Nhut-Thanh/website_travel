import HeroBanner from "@/components/home/Hero/HeroBanner";
import SearchBar from "@/components/home/SearchBar/SearchBar";
import AboutUsSection from "@/components/home/AboutUsSection";
import HomeAIRecommendationsSection from "@/components/home/HomeAIRecommendationsSection";
import FlashDealsSection from "@/components/home/FlashDeals/FlashDealsSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import FeaturedToursSection from "@/components/home/FeaturedTours/FeaturedToursSection";
import FavoriteDestinations from "@/components/home/FavoriteDestinations";
import { getPublicBanners } from "@/lib/bannerApi";

export default async function HomePage() {
  const banners = await getPublicBanners();

  return (
    <main className="min-h-screen bg-white">
      <HeroBanner banners={banners} />
      <SearchBar />
      <AboutUsSection />
      <HomeAIRecommendationsSection />
      <WhyChooseSection />
      <FlashDealsSection />
      <FavoriteDestinations />
      <FeaturedToursSection />
    </main>
  );
}
