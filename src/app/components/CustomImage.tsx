"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const defaultFallback = "/images/linuxunity-placeholder.svg";

interface CustomImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function CustomImage({
  src,
  fallbackSrc = defaultFallback,
  alt,
  onError,
  ...props
}: CustomImageProps) {
  const normalizedSrc = src || fallbackSrc;
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
