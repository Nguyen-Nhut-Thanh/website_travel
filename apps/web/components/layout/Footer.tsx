"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Không hiển thị Footer trong các trang quản trị admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gradient-to-br from-[#8dbaf5] via-[#C5D9EC] to-[#afd3f3] px-4 py-12 text-base text-black sm:px-6 lg:px-20">
      <div className="container mx-auto">
        <div className="flex flex-wrap -mx-4">
          {/* Column 1: Điểm đến */}
          <div className="order-2 mt-6 hidden w-full px-4 md:order-1 md:mt-0 md:block md:w-1/3">
            <h3 className="mb-6 text-lg font-bold uppercase text-black">
              Điểm đến yêu thích
            </h3>

            <div className="flex flex-wrap -mx-2">
              <div className="w-1/2 px-2">
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/tours?destination=Hà Nội"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Hà Nội
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Hạ Long"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Hạ Long
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Đà Nẵng"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Đà Nẵng
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Nha Trang"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Nha Trang
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="w-1/2 px-2">
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/tours?destination=Phú Quốc"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Phú Quốc
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Cần Thơ"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Cần Thơ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Đà Lạt"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Đà Lạt
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Côn Đảo"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Côn Đảo
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?destination=Sapa"
                      className="relative block w-fit py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full"
                    >
                      Sapa
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2: Brand & Socials */}
          <div className="order-3 mt-6 flex w-full flex-col items-center px-4 text-center md:order-2 md:mt-0 md:w-1/3 md:items-start md:text-left">
            <h3 className="mb-4 text-xl font-black uppercase italic text-black">
              TRAVOL.
            </h3>

            <div className="mb-4 space-y-2">
              <p className="text-sm italic text-black/70">
                Hành trình du lịch với giá cả phải chăng.
              </p>
              <p className="text-sm font-semibold">
                <i className="bi bi-geo-alt-fill text-sky-500" /> Cần Thơ, Việt
                Nam
              </p>
            </div>

            <div className="mb-6 flex gap-4 text-2xl text-black">
              <a
                href="#"
                aria-label="Facebook"
                className="transition-all hover:-translate-y-1 hover:text-blue-700"
              >
                <i className="fab fa-facebook" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="transition-all hover:-translate-y-1 hover:text-sky-400"
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                href="#"
                aria-label="Tiktok"
                className="transition-all hover:-translate-y-1 hover:text-pink-600"
              >
                <i className="fab fa-tiktok" />
              </a>
              <a
                href="#"
                aria-label="Messenger"
                className="transition-all hover:-translate-y-1 hover:text-blue-500"
              >
                <i className="fa-brands fa-facebook-messenger" />
              </a>
            </div>

            <a
              href="tel:0799634281"
              className="rounded-full bg-red-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
            >
              <i className="bi bi-telephone-inbound" /> 0799 634 281
            </a>

            <p className="mt-3 text-[11px] text-black/50">
              Từ 7:00 - 23:00 hằng ngày.
            </p>
          </div>

          {/* Column 3: Booking & Services */}
          <div className="order-1 w-full px-4 md:order-3 md:w-1/3">
            <h3 className="mb-4 text-lg font-bold uppercase text-black">
              Tra cứu Booking
            </h3>

            <form className="mb-8 flex gap-2">
              <input
                type="text"
                placeholder="Mã đặt chỗ..."
                className="flex-1 rounded-full border border-blue-500 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="rounded-full bg-sky-500 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-sky-600"
              >
                TÌM
              </button>
            </form>

            <div className="hidden gap-8 md:flex">
              <div className="flex-1">
                <h4 className="mb-3 border-l-4 border-sky-500 pl-2 text-sm font-bold uppercase text-black">
                  Dòng tour
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/tours?type=Tour Cao Cấp"
                      className="relative block w-fit py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Tour Cao Cấp
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?type=Tour Giá Tốt"
                      className="relative block w-fit py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Tour Giá Tốt
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <h4 className="mb-3 border-l-4 border-sky-500 pl-2 text-sm font-bold uppercase text-black">
                  Dịch vụ lẻ
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/tours?service=Vé Máy Bay"
                      className="relative block w-fit py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Vé Máy Bay
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tours?service=Khách Sạn"
                      className="relative block w-fit py-0.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-sky-500 after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Khách Sạn
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <h3 className="mb-0 text-xs font-bold uppercase text-black">
            Chấp nhận thanh toán:
          </h3>

          <div className="flex gap-4 text-2xl text-black">
            <i className="fab fa-cc-visa cursor-pointer transition-all hover:-translate-y-1 hover:text-blue-800" />
            <i className="fab fa-cc-mastercard cursor-pointer transition-all hover:-translate-y-1 hover:text-red-500" />
            <i className="fab fa-cc-paypal cursor-pointer transition-all hover:-translate-y-1 hover:text-blue-400" />
            <i className="fab fa-cc-apple-pay cursor-pointer transition-all hover:-translate-y-1 hover:text-slate-600" />
          </div>
        </div>
      </div>
    </footer>
  );
}
