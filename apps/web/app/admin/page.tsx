"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Map,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, type DashboardStats } from "@/lib/admin/dashboardApi";
import { formatVND } from "@/lib/utils";

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled" | string;

type DashboardStat = {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  isUp: boolean;
  color: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        if (active) {
          setData(stats);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const stats: DashboardStat[] = [
    { 
      label: "Tổng doanh thu", 
      value: data ? formatVND(data.totalRevenue) : "0đ", 
      icon: DollarSign, 
      trend: "+12.5%", 
      isUp: true, 
      color: "bg-blue-50 text-blue-600" 
    },
    { 
      label: "Đơn đặt tour (tháng)", 
      value: data?.bookingsThisMonth || 0, 
      icon: Briefcase, 
      trend: "+8.2%", 
      isUp: true, 
      color: "bg-emerald-50 text-emerald-600" 
    },
    { 
      label: "Tour đang hoạt động", 
      value: data?.activeTours || 0, 
      icon: Map, 
      trend: "-2.1%", 
      isUp: false, 
      color: "bg-indigo-50 text-indigo-600" 
    },
    { 
      label: "Khách hàng mới", 
      value: data?.newUsers || 0, 
      icon: Users, 
      trend: "+18.4%", 
      isUp: true, 
      color: "bg-rose-50 text-rose-600" 
    },
  ];

  const statusMap: Record<string, { label: string; className: string }> = {
    confirmed: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-600 border-blue-100" },
    pending: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-600 border-amber-100" },
    paid: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    completed: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    cancelled: { label: "Đã hủy", className: "bg-rose-50 text-rose-600 border-rose-100" },
    cancel_requested: { label: "Yêu cầu hủy", className: "bg-rose-50 text-rose-600 border-rose-100" },
  };

  const getStatusDisplay = (status: string) => {
    return statusMap[status] || { label: status, className: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl" />
          <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-medium">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Tổng quan tình hình kinh doanh và vận hành.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tháng này</option>
            <option>Năm nay</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Tải báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isUp ? "text-emerald-600" : "text-rose-600"}`}>
                {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Đơn đặt tour mới nhất</h2>
            <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold w-[20%]">Mã đơn</th>
                  <th className="px-6 py-4 font-bold w-[50%]">Khách hàng</th>
                  <th className="px-6 py-4 font-bold w-[30%]">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data?.recentBookings.map((booking) => {
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{booking.id}</td>
                      <td className="px-6 py-4 text-slate-600">{booking.customer}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatVND(booking.amount)}</td>
                    </tr>
                  );
                })}
                {data?.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                      Chưa có đơn hàng nào gần đây.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <Link href="/admin/tours/new" className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                  <Map size={18} />
                </div>
                Thêm tour mới
              </Link>
              <Link href="/admin/marketing/vouchers" className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                  <Ticket size={18} />
                </div>
                Tạo mã khuyến mãi
              </Link>
              <Link href="/admin/banners" className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                <div className="bg-white p-2 rounded-lg shadow-sm text-amber-600">
                  <ImageIcon size={18} />
                </div>
                Cập nhật banner
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-emerald-400" />
              <h2 className="text-lg font-bold">Hiệu suất hệ thống</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Tải máy chủ (CPU)</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[24%] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Bộ nhớ (RAM)</span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[62%] rounded-full" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-400">
                <Clock size={14} />
                Cập nhật lần cuối: Vài giây trước
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
