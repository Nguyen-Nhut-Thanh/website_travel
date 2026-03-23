"use client";

import type { ReactNode } from "react";

type Tone = "neutral" | "primary" | "danger";

type AdminIconActionButtonProps = {
  icon: ReactNode;
  title: string;
  tone?: Tone;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
};

const toneClassMap: Record<Tone, string> = {
  neutral: "text-slate-400 hover:bg-slate-100",
  primary: "text-blue-600 hover:bg-blue-50",
  danger: "text-red-600 hover:bg-red-50",
};

function getClassName(tone: Tone) {
  return `rounded-lg p-2 transition-all ${toneClassMap[tone]}`;
}

export function AdminIconActionButton({
  icon,
  title,
  tone = "neutral",
  onClick,
  href,
  target,
  rel,
}: AdminIconActionButtonProps) {
  const className = getClassName(tone);

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={className} title={title}>
        {icon}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {icon}
    </button>
  );
}
