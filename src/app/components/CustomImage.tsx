"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const defaultFallback = "/images/linuxunity-placeholder.svg";

interface CustomImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

function normalizeSource(source: string | null | undefined, fallback: string) {
  const value = source?.trim().replaceAll("&amp;", "&");
  if (!value) return fallback;
  if (value.startsWith("//")) return `https:${value}`;
  if (/^(https?:\/\/|\/)/i.test(value)) return value;
  return `/${value.replace(/^\.?\//, "")}`;
}

export default function CustomImage({
  src,
  fallbackSrc = defaultFallback,
  alt,
  onError,
  ...props
}: CustomImageProps) {
  const normalizedSrc = normalizeSource(src, fallbackSrc);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setFailedSrc(normalizedSrc);
        }
      }}
    />
  );
}
