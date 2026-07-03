"use client";

import { useEffect } from "react";

interface ArticleImageEnhancerProps {
  assetBase?: string;
  containerSelector?: string;
  contentKey: string;
  legacyAssetOrigins?: string[];
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

function normalizeLegacyAssetUrl(url: URL, assetOrigin: string, legacyAssetOrigins: string[]) {
  const origin = url.origin.replace(/\/$/, "");
  const isLegacyOrigin = legacyAssetOrigins.includes(origin);
  const isWordPressAsset =
    url.pathname.includes("/wp-content/") || url.pathname.includes("/wp-includes/");

  if (!assetOrigin || !isLegacyOrigin || !isWordPressAsset) return null;

  const assetPath = url.pathname.replace(/^.*?(\/wp-(?:content|includes)\/)/, "$1");
  return `${trimTrailingSlash(assetOrigin)}${assetPath}${url.search}${url.hash}`;
}

function normalizeAssetUrl(value: string, assetOrigin: string, legacyAssetOrigins: string[]) {
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
    const legacyUrl = normalizeLegacyAssetUrl(url, normalizedOrigin, legacyAssetOrigins);
    if (legacyUrl) return legacyUrl;

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

function normalizeSrcSet(value: string, assetOrigin: string, legacyAssetOrigins: string[]) {
  return value
    .split(",")
    .map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      if (!url) return candidate;
      return [normalizeAssetUrl(url, assetOrigin, legacyAssetOrigins), ...descriptor].join(" ");
    })
    .join(", ");
}

export default function ArticleImageEnhancer({
  assetBase,
  containerSelector = ".article-content",
  contentKey,
  legacyAssetOrigins = [],
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
      const nextSrc = normalizeAssetUrl(
        lazySrc || image.getAttribute("src") || "",
        assetOrigin,
        legacyAssetOrigins
      );
      if (nextSrc && image.src !== nextSrc) {
        image.src = nextSrc;
      }

      const srcSet = image.getAttribute("srcset") || image.dataset.srcset;
      if (srcSet) {
        image.setAttribute("srcset", normalizeSrcSet(srcSet, assetOrigin, legacyAssetOrigins));
      }

      const handleError = () => {
        if (image.dataset.fallbackApplied === "true") return;

        image.removeAttribute("srcset");
        image.dataset.fallbackApplied = "true";
        image.classList.add("article-image--fallback");
        image.alt = image.alt || "LinuxUnity image unavailable";
        image.src = "/images/linuxunity-placeholder.svg";
      };

      image.addEventListener("error", handleError, { once: true });
      cleanupHandlers.push(() => image.removeEventListener("error", handleError));
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [assetBase, containerSelector, contentKey, legacyAssetOrigins]);

  return null;
}
