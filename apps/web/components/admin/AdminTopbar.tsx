"use client";
import { Search, Bell, Menu } from "lucide-react";
import Image from "next/image";

export const AdminTopbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left side: Search & Mobile Menu Toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden text-slate-500 hover:text-slate-700">
          <Menu size={24} />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tour, mã booking, khách hàng..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
            A
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-bold text-slate-900 leading-tight">Admin</p>
            <p className="text-[11px] text-slate-500 leading-tight">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
};
