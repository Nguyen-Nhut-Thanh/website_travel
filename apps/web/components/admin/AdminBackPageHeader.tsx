"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type AdminBackPageHeaderProps = {
  title: string;
  description?: string;
  onBack: () => void;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function AdminBackPageHeader({
  title,
  description,
  onBack,
  meta,
  actions,
}: AdminBackPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
          ) : null}
          {meta}
        </div>
      </div>
      {actions}
    </div>
  );
}
