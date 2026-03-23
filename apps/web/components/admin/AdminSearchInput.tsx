"use client";

import { Search } from "lucide-react";

type AdminSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  roundedClassName?: string;
  className?: string;
};

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  roundedClassName = "rounded-xl",
  className = "",
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/20 ${roundedClassName}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
