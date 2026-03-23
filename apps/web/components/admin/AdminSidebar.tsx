"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Compass,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  Ticket,
  Users,
  Zap,
} from "lucide-react";
import { removeToken } from "@/lib/auth";

const menuItems = [
  {
    group: "Điều hướng",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Quản lý Tour", href: "/admin/tours", icon: Map },
      { name: "Lịch khởi hành", href: "/admin/schedules", icon: CalendarDays },
      { name: "Quản lý Địa điểm", href: "/admin/locations", icon: MapPin },
      { name: "Địa điểm yêu thích", href: "/admin/locations/featured", icon: Star },
      { name: "Quản lý Booking", href: "/admin/bookings", icon: Briefcase },
    ],
  },
  {
    group: "Khách hàng & Marketing",
    items: [
      { name: "Người dùng", href: "/admin/users", icon: Users },
      { name: "Flash Deals", href: "/admin/marketing/flash-deals", icon: Zap },
      { name: "Mã giảm giá", href: "/admin/marketing/vouchers", icon: Ticket },
      { name: "Bài viết", href: "/admin/marketing/posts", icon: FileText },
      { name: "Đánh giá", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    group: "Nội dung & Giao tiếp",
    items: [
      { name: "Quản lý Banner", href: "/admin/banners", icon: ImageIcon },
      { name: "Hỗ trợ khách hàng", href: "/admin/chats", icon: MessageSquare },
    ],
  },
  {
    group: "Hệ thống",
    items: [{ name: "Cài đặt hệ thống", href: "/admin/settings", icon: Settings }],
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("admin_auth_status");
      window.sessionStorage.removeItem("admin_auth_message");
    }
    router.replace("/admin/login");
  };

  return (
    <aside className="z-40 flex h-screen w-64 flex-shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300 shadow-xl sticky top-0">
      <div className="flex h-16 items-center border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-white">
          <Compass className="text-blue-500" size={24} />
          Travol<span className="text-blue-500">.</span>Admin
        </div>
      </div>

      <div className="p-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 transition-transform group-hover:scale-110">
            <ArrowLeft size={16} />
          </div>
          Quay lại website
        </Link>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {menuItems.map((group) => (
          <div key={group.group} className="mb-6">
            <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.group}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      (pathname.startsWith(`${item.href}/`) &&
                        !menuItems.some((menuGroup) =>
                          menuGroup.items.some(
                            (menuItem) =>
                              menuItem.href !== item.href &&
                              menuItem.href.startsWith(item.href) &&
                              pathname.startsWith(menuItem.href),
                          ),
                        ));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};
