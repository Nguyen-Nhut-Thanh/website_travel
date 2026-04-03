"use client";

import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label?: string;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
};

export default function TourMetaItem({
  icon,
  label,
  value,
  labelClassName = "shrink-0 font-semibold text-gray-700",
  valueClassName = "truncate",
  className = "flex items-center gap-2 overflow-hidden whitespace-nowrap",
}: Props) {
  return (
    <div className={className}>
      {icon}
      {label ? <span className={labelClassName}>{label}</span> : null}
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
