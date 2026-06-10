"use client";

import { useEffect } from "react";

interface ArticleImageEnhancerProps {
  assetBase?: string;
  containerSelector?: string;
  contentKey: string;
}

function trimTrailingSlash(value = "") {
  return value.replace(/\/$/, "");
}

function getAssetOrigin(assetBase?: string) {
  if (assetBase) {
    try {
      return new URL(assetBase).origin;
    } catch {
      return trimTrailingSlash(assetBase);
    }
  }

  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function normalizeAssetUrl(value: string, assetOrigin: string) {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;

  const normalizedOrigin = trimTrailingSlash(assetOrigin);
  if (value.startsWith("//")) {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
    return `${protocol}${value}`;
  }

  if (value.startsWith("/wp-content/") || value.startsWith("/wp-includes/")) {
    return normalizedOrigin ? `${normalizedOrigin}${value}` : value;
  }

  try {
    const url = new URL(value, normalizedOrigin || window.location.origin);
    if (url.hostname === "wordpress" || url.hostname === "localhost") {
      return normalizedOrigin
        ? `${normalizedOrigin}${url.pathname}${url.search}${url.hash}`
        : `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}

function normalizeSrcSet(value: string, assetOrigin: string) {
  return value
    .split(",")
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      if (!url) return candidate;
      return [normalizeAssetUrl(url, assetOrigin), ...descriptor].join(" ");
    })
    .join(", ");
}

export default function ArticleImageEnhancer({
  assetBase,
  containerSelector = ".article-content",
  contentKey,
}: ArticleImageEnhancerProps) {
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const assetOrigin = getAssetOrigin(assetBase);
    const images = Array.from(container.querySelectorAll("img"));
    const cleanupHandlers: Array<() => void> = [];

    images.forEach((image) => {
      if (!(image instanceof HTMLImageElement)) return;

      image.loading = image.loading || "lazy";
      image.decoding = "async";
      image.classList.add("article-image");

      const lazySrc = image.dataset.src || image.dataset.lazySrc || image.getAttribute("data-original");
      const nextSrc = normalizeAssetUrl(lazySrc || image.getAttribute("src") || "", assetOrigin);
      if (nextSrc && image.src !== nextSrc) {
        image.src = nextSrc;
      }

      const srcSet = image.getAttribute("srcset") || image.dataset.srcset;
      if (srcSet) {
        image.setAttribute("srcset", normalizeSrcSet(srcSet, assetOrigin));
      }

      const handleError = () => {
        image.removeAttribute("srcset");
        image.classList.add("article-image--broken");
        image.alt = image.alt || "Image unavailable";

        const fallback = document.createElement("div");
        fallback.className = "article-image-fallback";
        fallback.textContent = image.alt;
        image.replaceWith(fallback);
      };

      image.addEventListener("error", handleError, { once: true });
      cleanupHandlers.push(() => image.removeEventListener("error", handleError));
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [assetBase, containerSelector, contentKey]);

  return null;
}
