"use client";

import React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Briefcase,
  Heart,
  Sparkles,
  User,
  MapPin,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/account";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
}

const menuItems = [
  { id: "overview", label: "Tổng quan tài khoản", icon: LayoutDashboard },
  { id: "bookings", label: "Đơn đặt tour của tôi", icon: Briefcase },
  { id: "favorites", label: "Tour yêu thích", icon: Heart },
  { id: "preferences", label: "Gu du lịch AI", icon: Sparkles },
  { id: "profile", label: "Thông tin cá nhân", icon: User },
  { id: "address", label: "Thông tin liên hệ", icon: MapPin },
  { id: "password", label: "Đổi mật khẩu", icon: Lock },
];

export const AccountSidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
}) => {
  const router = useRouter();
  const isStaff = user?.is_staff;
  const profileCompletion = [
    user?.full_name,
    user?.phone,
    user?.address,
    user?.number_id,
  ].filter(Boolean).length;
  const profileProgress = Math.round((profileCompletion / 4) * 100);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(160deg,#eff6ff_0%,#f8fbff_60%,#ffffff_100%)] p-6">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_65%)]" />
        <div className="relative text-center">
          <div className="relative mx-auto mb-4 h-24 w-24">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-slate-950 text-white shadow-lg shadow-slate-200">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "Avatar"}
                  fill
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-[family:var(--font-display)] text-3xl font-semibold">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            {isStaff && (
              <div
                className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-amber-400 p-1.5 text-white shadow-sm"
                title="Quản trị viên"
              >
                <ShieldCheck size={14} />
              </div>
            )}
          </div>

          <h3 className="font-[family:var(--font-display)] text-xl font-semibold text-slate-950">
            {user?.full_name || "Người dùng"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{user?.accounts?.email}</p>

          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-left shadow-sm">
            <div className="flex items-center justify-between text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Hồ sơ</span>
              <span>{profileProgress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a,#2563eb)]"
                style={{ width: `${profileProgress}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Hoàn thiện thêm thông tin để việc đặt chỗ và hỗ trợ được nhanh hơn.
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {isStaff && (
            <li className="mb-2">
              <button
                onClick={() => router.push("/admin")}
                className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100"
              >
                <ShieldCheck size={18} />
                Quản lý hệ thống
              </button>
            </li>
          )}

          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white shadow-lg shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            </li>
          ))}

          <li className="mt-2 border-t border-slate-100 pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
