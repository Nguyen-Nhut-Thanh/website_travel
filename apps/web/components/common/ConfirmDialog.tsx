"use client";

import type { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmClassName?: string;
};

export function ConfirmDialog({
  open,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmClassName = "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] border border-slate-100 bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            {icon}
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-3 px-2 text-sm font-medium leading-relaxed text-slate-500">
            {description}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${confirmClassName}`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
