"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPublicStorageUrl, getPublicThumbUrl } from "@/lib/storage/public-url";

type AppImageProps = {
  path?: string | null;
  src?: string | null;
  alt: string;
  variant?: "thumb" | "display";
  aspect?: "card" | "wide" | "natural";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function AppImage({
  path,
  src,
  alt,
  variant = "display",
  aspect = "natural",
  className,
  imgClassName,
  priority = false,
}: AppImageProps) {
  const preferred =
    src ??
    (variant === "thumb" ? getPublicThumbUrl(path ?? null) : getPublicStorageUrl(path ?? null));
  const fallback = src ?? getPublicStorageUrl(path ?? null);
  const [url, setUrl] = useState(preferred);

  if (!url) return null;

  const aspectClass =
    aspect === "card" ? "aspect-[4/3]" : aspect === "wide" ? "aspect-[16/10]" : undefined;

  return (
    <div className={cn("overflow-hidden", aspectClass, className)}>
      <img
        src={url}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          aspect === "natural" ? "h-auto w-full" : "h-full w-full object-cover",
          imgClassName,
        )}
        onError={() => {
          if (variant === "thumb" && fallback && fallback !== url) setUrl(fallback);
        }}
      />
    </div>
  );
}
