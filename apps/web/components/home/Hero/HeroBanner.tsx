"use client";

import Link from "next/link";
import { memo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  User, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Globe, 
  Menu, 
  X,
  Loader2
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { navData } from "@/lib/nav-data";
import { useNavLocationData } from "@/lib/useNavLocationData";
import type { Banner } from "../../../types/banner";
import HeroBannerStyle from "./HeroBannerStyle";
import { useHeroBannerSlider } from "./useHeroBannerSlider";

type HeroBannerProps = {
  banners: Banner[];
};

type BannerItem = Banner & {
  description: string;
  link_to: string;
};

const SlideItems = memo(function SlideItems({
  items,
}: {
  items: BannerItem[];
}) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.banner_id}
          className="hero-banner-item absolute cursor-pointer overflow-hidden rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{
            backgroundImage: `url('${item.image_url}')`,
          }}
          data-banner-id={item.banner_id}
          data-location={item.location_name}
          data-title={item.header}
          data-description={item.description}
          data-image-url={item.image_url}
          data-link-to={item.link_to}
        >
          <div className="thumb-content absolute bottom-4 left-4 right-4 z-[2] text-white transition-opacity duration-300">
            <div className="mb-1 text-[11px] text-[rgba(255,255,255,0.9)]">
              {item.location_name}
            </div>
            <div className="text-[20px] font-bold uppercase leading-[1.1]">
              {item.header}
            </div>
          </div>
        </div>
      ))}
    </>
  );
});

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { navLocationData, isLoadingNav } = useNavLocationData();
  const pathname = usePathname();

  const {
    normalizedBanners,
    slideContainerRef,
    activeBanner,
    animateKey,
    totalItems,
    currentIndex,
    progressWidth,
    handleNextSlide,
    handlePrevSlide,
    handleContainerClick,
  } = useHeroBannerSlider({
    banners,
    autoSlideDelay: 5000,
    slideAnimationDuration: 800,
  });

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(i => i !== title) : [...prev, title]
    );
  };

  if (!totalItems) {
    return (
      <section className="relative min-h-[700px] w-full overflow-hidden bg-[#111]">
        <div className="flex min-h-[700px] items-center justify-center px-6 text-center text-white">
          <div>
            <h2 className="text-3xl font-bold">Chưa có banner</h2>
            <p className="mt-3 text-sm text-white/70">
              Hãy thêm dữ liệu vào bảng banners để hiển thị banner trang chủ.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <HeroBannerStyle />

      <section className="hero-section relative min-h-[700px] w-full overflow-hidden bg-[#111]">
        <div
          ref={slideContainerRef}
          className="slide absolute inset-0"
          id="slideContainer"
          onClick={handleContainerClick}
        >
          <SlideItems items={normalizedBanners} />
        </div>

        {/* Header Overlay */}
        <div className="absolute left-0 top-0 z-[100] flex w-full items-center justify-between px-[42px] py-[26px] max-[991px]:px-6 max-[991px]:py-[26px]">
          <Link href="/" className="text-[24px] font-black uppercase italic tracking-[-0.5px] text-white no-underline">
            TRAVOL<span className="text-[#f2c94c]">.</span>
          </Link>

          <div className="flex items-center gap-[42px]">
            <nav className="flex items-center gap-[32px] max-[1024px]:hidden h-full">
              {navData.map((item) => (
                <div key={item.title} className="group relative flex items-center">
                  {item.isMega ? (
                    <button className="flex items-center gap-1.5 text-[14px] font-bold uppercase tracking-[1px] text-[rgba(255,255,255,0.85)] no-underline hover:text-white transition-colors py-2 outline-none">
                      {item.title}
                      <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative text-[14px] font-bold uppercase tracking-[1px] no-underline transition-colors py-2 ${
                        pathname === item.href ? "text-white after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#f2c94c] after:content-['']" : "text-[rgba(255,255,255,0.85)] hover:text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}

                  {/* Mega Menu Desktop for Hero Banner */}
                  {item.isMega && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[1000px] bg-white shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden">
                      {isLoadingNav ? (
                        <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span className="text-xs font-medium">Đang tải địa điểm...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 min-h-[400px]">
                          <div className="col-span-9 p-8 border-r border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-6 text-blue-600">
                              <MapPin size={20} />
                              <span className="font-bold uppercase tracking-wider text-sm">Trong nước</span>
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                              {navLocationData?.domestic.map((region) => (
                                <div key={region.region}>
                                  <h4 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 text-[11px] uppercase tracking-widest">{region.region}</h4>
                                  <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                                    {region.cities.map(city => (
                                      <li key={city.slug}>
                                        <Link href={`/tours?location=${city.slug}`} className="text-[12px] text-gray-500 hover:text-blue-600 transition-colors block font-medium">
                                          {city.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-3 p-8 bg-white">
                            <div className="flex items-center gap-2 mb-6 text-amber-500">
                              <Globe size={20} />
                              <span className="font-bold uppercase tracking-wider text-sm">Quốc tế</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto pr-2 no-scrollbar space-y-2">
                              {navLocationData?.international.map(country => (
                                <Link 
                                  key={country.slug} 
                                  href={`/tours?country=${country.slug}`}
                                  className="text-[12px] text-gray-500 hover:text-blue-600 block py-1 transition-colors font-bold"
                                >
                                  {country.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-[24px] border-l border-[rgba(255,255,255,0.2)] pl-[24px] max-[640px]:gap-[12px] max-[640px]:pl-[12px]">
              <div className="flex items-center gap-2.5 leading-none cursor-pointer max-[480px]:hidden">
                <img src="https://flagcdn.com/vn.svg" className="w-7 h-5 rounded-sm object-cover shadow-sm" alt="Vietnam Flag" />
                <span className="text-[12px] font-bold text-white uppercase tracking-[0.5px]">VND</span>
              </div>
              
              <Link 
                href={isLoggedIn ? "/account" : "/login"} 
                className={`flex h-[38px] w-[38px] items-center justify-center rounded-full backdrop-blur-[10px] transition-all ${
                  isLoggedIn 
                  ? "bg-[#f2c94c] text-black shadow-[0_0_15px_rgba(242,201,76,0.4)]" 
                  : "bg-[rgba(255,255,255,0.12)] text-white hover:bg-[#f2c94c] hover:text-black"
                }`}
                aria-label="User Account"
              >
                <User size={15} />
              </Link>

              <button 
                className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        <div className={`fixed inset-0 z-[110] lg:hidden transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" className="text-xl font-black uppercase italic text-blue-600">
                TRAVOL<span className="text-amber-400">.</span>
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              <nav className="space-y-1">
                {navData.map(item => (
                  <div key={item.title} className="border-b border-gray-50 last:border-0">
                    {item.isMega ? (
                      <div>
                        <button 
                          onClick={() => toggleExpand(item.title)}
                          className="w-full flex items-center justify-between p-4 text-sm font-bold uppercase tracking-wider text-gray-800"
                        >
                          {item.title}
                          <ChevronDown size={18} className={`transition-transform duration-300 ${expandedItems.includes(item.title) ? "rotate-180" : ""}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${expandedItems.includes(item.title) ? "max-height-[2000px] pb-4" : "max-h-0"}`}>
                          <div className="px-4">
                            {isLoadingNav ? (
                              <div className="py-4 text-center text-xs text-gray-400">Đang tải địa điểm...</div>
                            ) : (
                              <>
                                <button onClick={() => toggleExpand("trong-nuoc")} className="w-full flex items-center justify-between py-3 text-xs font-bold text-blue-600">
                                  <span className="flex items-center gap-2"><MapPin size={14} /> Trong nước</span>
                                  <ChevronDown size={14} className={expandedItems.includes("trong-nuoc") ? "rotate-180" : ""} />
                                </button>
                                {expandedItems.includes("trong-nuoc") && (
                                  <div className="pl-4 space-y-4 py-2">
                                    {navLocationData?.domestic.map((region) => (
                                      <div key={region.region}>
                                        <h5 className="text-[11px] font-bold uppercase text-gray-400 mb-2">{region.region}</h5>
                                        <div className="grid grid-cols-2 gap-2">
                                          {region.cities.map(city => (
                                            <Link key={city.slug} href={`/tours?location=${city.slug}`} className="text-[12px] text-gray-600 py-1 font-medium" onClick={() => setIsMenuOpen(false)}>
                                              {city.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button onClick={() => toggleExpand("ngoai-nuoc")} className="w-full flex items-center justify-between py-3 text-xs font-bold text-amber-500">
                                  <span className="flex items-center gap-2"><Globe size={14} /> Ngoài nước</span>
                                  <ChevronDown size={14} className={expandedItems.includes("ngoai-nuoc") ? "rotate-180" : ""} />
                                </button>
                                {expandedItems.includes("ngoai-nuoc") && (
                                  <div className="pl-4 grid grid-cols-2 gap-2 py-2">
                                    {navLocationData?.international.map(country => (
                                      <Link key={country.slug} href={`/tours?country=${country.slug}`} className="text-[12px] text-gray-600 py-1 font-bold" onClick={() => setIsMenuOpen(false)}>
                                        {country.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href={item.href} className="block p-4 text-sm font-bold uppercase tracking-wider text-gray-800" onClick={() => setIsMenuOpen(false)}>
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            
            <div className="p-6 bg-gray-50 mt-auto">
              {isLoggedIn ? (
                <Link href="/account" className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">U</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Tài khoản</div>
                  </div>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/login" className="py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-xl font-bold text-xs" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link href="/register" className="py-3 px-4 bg-blue-600 text-white text-center rounded-xl font-bold text-xs" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          key={animateKey}
          className="animate-hero-content absolute left-[52px] top-1/2 z-[15] w-[min(420px,42vw)] -translate-y-1/2 text-white max-[991px]:left-6 max-[991px]:top-[110px] max-[991px]:w-[90%] max-[991px]:translate-y-0"
        >
          <div className="hero-meta mb-2 text-[18px] font-medium text-[rgba(255,255,255,0.9)]">
            {activeBanner?.location_name || ""}
          </div>

          <h1 className="hero-title mb-5 text-[clamp(44px,5vw,76px)] font-extrabold capitalize leading-[0.95] drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            {activeBanner?.header || ""}
          </h1>

          <p className="hero-desc mb-6 max-w-[360px] text-[14px] leading-[1.75] text-[rgba(255,255,255,0.75)]">
            {activeBanner?.description || ""}
          </p>

          <a
            href={activeBanner?.link_to || "#"}
            className="hero-action inline-flex items-center gap-[10px] rounded-full border border-[rgba(255,255,255,0.22)] bg-[rgba(0,0,0,0.28)] px-[18px] py-[11px] text-[12px] font-semibold uppercase text-white no-underline backdrop-blur-[8px] transition duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-[rgba(255,255,255,0.14)]"
          >
            Discover Location
          </a>
        </div>

        <div className="absolute bottom-12 left-[calc(50%+10px)] z-20 flex w-[min(42vw,520px)] -translate-x-1/2 items-center gap-[18px] max-[991px]:bottom-[55px] max-[991px]:left-6 max-[991px]:right-[90px] max-[991px]:w-auto max-[991px]:translate-x-0 max-[640px]:right-[70px] max-[640px]:gap-3">
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(0,0,0,0.25)] text-[18px] text-white backdrop-blur-[8px] transition duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.18)]"
              aria-label="Previous banner"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(0,0,0,0.25)] text-[18px] text-white backdrop-blur-[8px] transition duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.18)]"
              aria-label="Next banner"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="relative h-[3px] flex-1 rounded-full bg-[rgba(255,255,255,0.22)]">
            <div
              className="absolute left-0 top-0 h-full rounded-[inherit] bg-[rgba(255,214,78,0.9)] transition-[width] duration-[450ms] ease-in-out"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className="absolute bottom-[38px] right-[42px] z-20 text-[36px] font-bold leading-none text-white max-[640px]:bottom-[60px] max-[640px]:text-[24px]">
          <span>{currentIndex}</span>
          <small className="ml-1 text-[16px] font-medium opacity-75">
            / {totalItems}
          </small>
        </div>
      </section>
    </>
  );
}
