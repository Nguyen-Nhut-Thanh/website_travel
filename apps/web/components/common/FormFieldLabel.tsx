"use client";

import type { ReactNode } from "react";

type FormFieldLabelProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export default function FormFieldLabel({
  children,
  icon,
  className = "",
}: FormFieldLabelProps) {
  return (
    <label
      className={`text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 ${className}`.trim()}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
    </label>
  );
}
