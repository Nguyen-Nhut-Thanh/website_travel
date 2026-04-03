"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type AdminModalShellProps = {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
};

export function AdminModalShell({
  title,
  icon,
  onClose,
  children,
  footer,
  maxWidthClassName = "max-w-2xl",
}: AdminModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className={`w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl ${maxWidthClassName}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
          <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900">
            {icon ? <div className="rounded-xl bg-blue-50 p-2 text-blue-600">{icon}</div> : null}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>

        {footer ? (
          <div className="flex gap-4 border-t border-slate-100 bg-slate-50/50 p-8">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
