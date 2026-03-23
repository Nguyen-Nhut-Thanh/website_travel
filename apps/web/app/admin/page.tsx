"use client";

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

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

type DashboardStat = {
  label: string;
  value: string;
  icon: typeof DollarSign;
  trend: string;
  isUp: boolean;
  color: string;
};

type DashboardBooking = {
  id: string;
  customer: string;
  tour: string;
  date: string;
  amount: string;
  status: BookingStatus;
};

export default function AdminDashboard() {
  const stats: DashboardStat[] = [
    { label: "Tổng doanh thu", value: "245,500,000đ", icon: DollarSign, trend: "+12.5%", isUp: true, color: "bg-blue-50 text-blue-600" },
    { label: "Đơn đặt tour (tháng)", value: "156", icon: Briefcase, trend: "+8.2%", isUp: true, color: "bg-emerald-50 text-emerald-600" },
    { label: "Tour đang hoạt động", value: "42", icon: Map, trend: "-2.1%", isUp: false, color: "bg-indigo-50 text-indigo-600" },
    { label: "Khách hàng mới", value: "2,405", icon: Users, trend: "+18.4%", isUp: true, color: "bg-rose-50 text-rose-600" },
  ];

  const recentBookings: DashboardBooking[] = [
    { id: "BK001", customer: "Nguyễn Văn A", tour: "Đà Lạt 3N2Đ", date: "15/03/2026", amount: "4,500,000đ", status: "confirmed" },
    { id: "BK002", customer: "Trần Thị B", tour: "Phú Quốc 4N3Đ", date: "16/03/2026", amount: "6,200,000đ", status: "pending" },
    { id: "BK003", customer: "Lê Văn C", tour: "Hạ Long 3N2Đ", date: "18/03/2026", amount: "5,800,000đ", status: "completed" },
    { id: "BK004", customer: "Phạm Thị D", tour: "Sapa 2N1Đ", date: "20/03/2026", amount: "3,100,000đ", status: "cancelled" },
  ];

  const statusMap: Record<BookingStatus, { label: string; className: string }> = {
    confirmed: { label: "Đã xác nhận", className: "bg-blue-50 text-blue-600 border-blue-100" },
    pending: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-600 border-amber-100" },
    completed: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    cancelled: { label: "Đã hủy", className: "bg-rose-50 text-rose-600 border-rose-100" },
  };

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
                  <th className="px-6 py-4 font-bold">Mã đơn</th>
                  <th className="px-6 py-4 font-bold">Khách hàng</th>
                  <th className="px-6 py-4 font-bold">Tour</th>
                  <th className="px-6 py-4 font-bold">Tổng tiền</th>
                  <th className="px-6 py-4 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{booking.id}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.customer}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.tour}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{booking.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusMap[booking.status].className}`}>
                        {statusMap[booking.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                  <Map size={18} />
                </div>
                Thêm tour mới
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors font-medium text-sm">
                <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                  <Ticket size={18} />
                </div>
                Tạo mã khuyến mãi
              </button>
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
