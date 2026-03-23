"use client";

import type { MouseEventHandler } from "react";
import { Heart, Loader2 } from "lucide-react";

type FavoriteButtonProps = {
  active: boolean;
  loading?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  iconClassName?: string;
  label?: string;
};

export default function FavoriteButton({
  active,
  loading = false,
  onClick,
  className = "",
  iconClassName = "",
  label,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-pressed={active}
      aria-label={label || (active ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích")}
      className={className}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${iconClassName}`} />
      ) : (
        <Heart
          className={iconClassName}
          fill={active ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
