"use client";

import React from "react";
import {
  Briefcase,
  Heart,
  Calendar,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { RecentBookings } from "./RecentBookings";
import type {
  AccountBooking,
  AccountStats,
  UserProfile,
} from "@/types/account";

interface OverviewProps {
  user: UserProfile | null;
  stats: AccountStats | null;
  bookings: AccountBooking[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

export const AccountOverview: React.FC<OverviewProps> = ({
  user,
  stats,
  bookings,
  loading,
  setActiveTab,
}) => {
  const statCards = [
    {
      label: "Tổng đơn đặt",
      value: stats?.totalBookings || 0,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-700",
      accent: "from-blue-500/20 to-transparent",
    },
    {
      label: "Tour yêu thích",
      value: stats?.totalFavorites || 0,
      icon: Heart,
      color: "bg-rose-50 text-rose-600",
      accent: "from-rose-500/20 to-transparent",
    },
    {
      label: "Chuyến đi sắp tới",
      value: stats?.upcomingTrips || 0,
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600",
      accent: "from-emerald-500/20 to-transparent",
    },
    {
      label: "Chờ thanh toán",
      value: stats?.pendingPayments || 0,
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600",
      accent: "from-amber-500/20 to-transparent",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.04)]"
          >
            <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${stat.accent}`} />
            <div className="relative">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {loading ? "..." : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[family:var(--font-display)] text-2xl font-semibold text-slate-950">
                Đặt chỗ gần đây
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Tổng hợp nhanh các giao dịch và chuyến đi bạn đang theo dõi.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("bookings")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition hover:text-slate-950"
            >
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>
          <RecentBookings bookings={bookings} loading={loading} limit={3} />
        </div>

        <div className="space-y-4">
          <h3 className="font-[family:var(--font-display)] text-2xl font-semibold text-slate-950">
            Hồ sơ cá nhân
          </h3>
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Họ và tên
                </span>
                <div className="mt-1 break-words text-base font-semibold text-slate-950">
                  {user?.full_name}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email đăng ký
                </span>
                <div
                  className="mt-1 truncate text-base font-semibold text-slate-950"
                  title={user?.accounts?.email || ""}
                >
                  {user?.accounts?.email}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Số điện thoại
                </span>
                <div className="mt-1 break-words text-base font-semibold text-slate-950">
                  {user?.phone || "Chưa cập nhật"}
                </div>
              </div>
              <button
                onClick={() => setActiveTab("profile")}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
