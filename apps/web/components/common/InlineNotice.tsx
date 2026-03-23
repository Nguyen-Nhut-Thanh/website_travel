"use client";

import type { ReactNode } from "react";

type InlineNoticeProps = {
  tone: "error" | "success";
  children: ReactNode;
  className?: string;
};

const toneClassMap = {
  error: "bg-red-50 border border-red-100 text-red-600",
  success: "bg-emerald-50 border border-emerald-100 text-emerald-600",
} as const;

export default function InlineNotice({
  tone,
  children,
  className = "",
}: InlineNoticeProps) {
  return (
    <div className={`rounded-xl p-4 text-sm font-medium ${toneClassMap[tone]} ${className}`.trim()}>
      {children}
    </div>
  );
}
