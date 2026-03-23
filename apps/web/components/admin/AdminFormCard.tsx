"use client";

import type { ReactNode } from "react";

type AdminFormCardProps = {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
};

export function AdminFormCard({
  title,
  icon,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  titleClassName = "",
}: AdminFormCardProps) {
  const hasHeader = Boolean(title || icon);

  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm ${className}`.trim()}>
      {hasHeader ? (
        <div className={`flex items-center gap-2 border-b border-slate-50 p-6 ${headerClassName}`.trim()}>
          {icon}
          {title ? (
            <h2 className={`font-bold text-slate-900 ${titleClassName}`.trim()}>{title}</h2>
          ) : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
