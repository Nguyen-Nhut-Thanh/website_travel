"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function AdminPageHeader({ title, description, actions, primaryAction }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            {primaryAction.icon || <Plus size={18} />}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
