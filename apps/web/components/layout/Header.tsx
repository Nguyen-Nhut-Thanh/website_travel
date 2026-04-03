"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { User, ChevronDown, Menu, X, MapPin, Globe, Loader2 } from "lucide-react";
import { getToken } from "@/lib/auth";
import { navData } from "@/lib/nav-data";
import { publicFetch } from "@/lib/publicFetch";

interface NavLocationData {
  domestic: {
    region: string;
    cities: { name: string; slug: string }[];
  }[];
  international: { name: string; slug: string }[];
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [navLocationData, setNavLocationData] = useState<NavLocationData | null>(null);
  const [isLoadingNav, setIsLoadingNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchNavData = async () => {
      setIsLoadingNav(true);
      try {
        const data = await publicFetch<NavLocationData>("/locations/nav");
        setNavLocationData(data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu menu:", err);
      } finally {
        setIsLoadingNav(false);
      }
    };
    fetchNavData();
  }, []);

  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(i => i !== title) : [...prev, title]
    );
  };

  const NavLink = ({ item }: { item: typeof navData[0] }) => {
    const isActive = pathname === item.href;
    
    if (item.isMega) {
      return (
        <div className="group relative">
          <button className={`flex items-center gap-1 text-[13px] font-bold uppercase tracking-[1px] py-6 transition-colors ${
            isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-600"
          }`}>
            {item.title}
            <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-[1100px] bg-white shadow-2xl rounded-b-2xl border-t border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden">
            {isLoadingNav ? (
              <div className="flex items-center justify-center p-20 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span className="font-medium">Đang tải địa điểm...</span>
              </div>
            ) : (
              <div className="grid grid-cols-12 min-h-[450px]">
                <div className="col-span-9 p-10 border-r border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-3 mb-8 text-blue-600">
                    <MapPin size={24} />
                    <span className="font-bold uppercase tracking-[2px] text-base">Điểm đến Trong nước</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-10">
                    {navLocationData?.domestic.map((region) => (
                      <div key={region.region}>
                        <h4 className="font-bold text-gray-900 mb-5 pb-3 border-b-2 border-blue-100 text-[13px] uppercase tracking-[1.5px] flex items-center justify-between">
                          {region.region}
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{region.cities.length}</span>
                        </h4>
                        <ul className="space-y-2.5 max-h-[300px] overflow-y-auto pr-4 no-scrollbar">
                          {region.cities.map(city => (
                            <li key={city.slug}>
                              <Link href={`/tours?location=${city.slug}`} className="text-[12px] text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all flex items-center gap-2 group/item font-medium">
                                <span className="w-1.5 h-1.5 bg-gray-200 rounded-full group-hover/item:bg-blue-600 group-hover/item:scale-125 transition-all"></span>
                                {city.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-3 p-10 bg-white">
                  <div className="flex items-center gap-3 mb-8 text-amber-500">
                    <Globe size={24} />
                    <span className="font-bold uppercase tracking-[2px] text-base">Quốc tế</span>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto pr-4 no-scrollbar space-y-1">
                    {navLocationData?.international.map(country => (
                      <Link 
                        key={country.slug} 
                        href={`/tours?country=${country.slug}`}
                        className="text-[12px] text-gray-500 hover:text-blue-600 flex items-center gap-2 hover:bg-amber-50/50 py-2.5 px-3 rounded-xl transition-all font-bold"
                      >
                        <span className="w-1.5 h-1.5 bg-amber-200 rounded-full"></span>
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <Link 
        href={item.href} 
        className={`text-[13px] font-bold uppercase tracking-[1px] py-6 transition-colors ${
          isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700 hover:text-blue-600"
        }`}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[100]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="text-[24px] font-black uppercase italic tracking-[-0.5px] text-blue-600 no-underline py-4">
            TRAVOL<span className="text-amber-400">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 h-full">
            {navData.map(item => (
              <NavLink key={item.title} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-4 lg:gap-6 lg:border-l lg:border-gray-100 lg:pl-6 py-4">
            <Link 
              href={isLoggedIn ? "/account" : "/login"} 
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isLoggedIn 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                : "bg-gray-100 text-gray-500 hover:bg-amber-400 hover:text-white"
              }`}
              aria-label="User Account"
            >
              <User size={18} />
            </Link>
            
            <button 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[110] lg:hidden transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className={`absolute left-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
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
                              <button 
                                onClick={() => toggleExpand("trong-nuoc")}
                                className="w-full flex items-center justify-between py-3 text-sm font-bold text-blue-600"
                              >
                                <span className="flex items-center gap-2"><MapPin size={16} /> Trong nước</span>
                                <ChevronDown size={16} className={expandedItems.includes("trong-nuoc") ? "rotate-180" : ""} />
                              </button>
                              
                              {expandedItems.includes("trong-nuoc") && (
                                <div className="pl-6 space-y-4 py-2">
                                  {navLocationData?.domestic.map((region) => (
                                    <div key={region.region}>
                                      <h5 className="text-[11px] font-bold uppercase text-gray-400 mb-2 tracking-widest">{region.region}</h5>
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

                              <button 
                                onClick={() => toggleExpand("ngoai-nuoc")}
                                className="w-full flex items-center justify-between py-3 text-sm font-bold text-amber-500"
                              >
                                <span className="flex items-center gap-2"><Globe size={16} /> Ngoài nước</span>
                                <ChevronDown size={16} className={expandedItems.includes("ngoai-nuoc") ? "rotate-180" : ""} />
                              </button>
                              
                              {expandedItems.includes("ngoai-nuoc") && (
                                <div className="pl-6 grid grid-cols-2 gap-2 py-2">
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

          <div className="p-6 bg-gray-50">
            {isLoggedIn ? (
              <Link href="/account" className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100" onClick={() => setIsMenuOpen(false)}>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">U</div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Tài khoản của tôi</div>
                  <div className="text-xs text-gray-500">Xem hồ sơ & đặt chỗ</div>
                </div>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link href="/login" className="py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-xl font-bold text-sm" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                <Link href="/register" className="py-3 px-4 bg-blue-600 text-white text-center rounded-xl font-bold text-sm" onClick={() => setIsMenuOpen(false)}>Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
