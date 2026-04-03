"use client";

import { useState } from "react";
import { PLACEHOLDER_IMAGE, normalizeImageSrc } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  fallback = PLACEHOLDER_IMAGE, 
  className,
  ...props 
}: ImageWithFallbackProps) {
  const normalizedSrc =
    normalizeImageSrc(typeof src === "string" ? src : undefined) || fallback;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgSrc = failedSrc === normalizedSrc ? fallback : normalizedSrc;

  const handleError = () => {
    if (failedSrc !== normalizedSrc) {
      setFailedSrc(normalizedSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
