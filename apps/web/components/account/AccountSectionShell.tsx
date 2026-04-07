"use client";

import type { ReactNode } from "react";

type AccountSectionShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AccountSectionShell({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
}: AccountSectionShellProps) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.05)] backdrop-blur ${className}`.trim()}
    >
      <div className="mb-8">
        <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>

      <div className={contentClassName}>{children}</div>
    </div>
  );
}
