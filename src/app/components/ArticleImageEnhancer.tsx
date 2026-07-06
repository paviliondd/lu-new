"use client";

import { useEffect, useRef, useState } from "react";

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
  const shouldRewriteLegacyAssets =
    process.env.NEXT_PUBLIC_REWRITE_LEGACY_WORDPRESS_ASSETS === "true";
  const origin = url.origin.replace(/\/$/, "");
  const isLegacyOrigin = legacyAssetOrigins.includes(origin);
  const isWordPressAsset =
    url.pathname.includes("/wp-content/") || url.pathname.includes("/wp-includes/");

  if (!assetOrigin || !shouldRewriteLegacyAssets || !isLegacyOrigin || !isWordPressAsset) {
    return null;
  }

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
  const [viewer, setViewer] = useState<{ src: string; alt: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const pinchDistance = useRef<number | null>(null);

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
      const handleOpen = () => {
        setScale(1);
        setRotation(0);
        setViewer({
          src: image.currentSrc || image.src,
          alt: image.alt || "Article image",
        });
      };

      image.addEventListener("error", handleError, { once: true });
      image.addEventListener("click", handleOpen);
      image.setAttribute("tabindex", "0");
      image.setAttribute("role", "button");
      const handleKeyOpen = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      };
      image.addEventListener("keydown", handleKeyOpen);
      cleanupHandlers.push(() => {
        image.removeEventListener("error", handleError);
        image.removeEventListener("click", handleOpen);
        image.removeEventListener("keydown", handleKeyOpen);
      });
    });

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [assetBase, containerSelector, contentKey, legacyAssetOrigins]);

  useEffect(() => {
    if (!viewer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewer(null);
      if (event.key === "+" || event.key === "=") setScale((value) => Math.min(4, value + 0.2));
      if (event.key === "-") setScale((value) => Math.max(0.25, value - 0.2));
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewer]);

  if (!viewer) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={() => setViewer(null)}
    >
      <div className="image-lightbox__toolbar" onClick={(event) => event.stopPropagation()}>
        <button className="image-lightbox__button" type="button" onClick={() => setScale((value) => Math.min(4, value + 0.25))}>
          Zoom +
        </button>
        <button className="image-lightbox__button" type="button" onClick={() => setScale((value) => Math.max(0.25, value - 0.25))}>
          Zoom -
        </button>
        <button className="image-lightbox__button" type="button" onClick={() => setScale(1)}>
          Fit
        </button>
        <button className="image-lightbox__button" type="button" onClick={() => setRotation((value) => value + 90)}>
          Rotate
        </button>
        <a className="image-lightbox__button" href={viewer.src} download>
          Download
        </a>
        <button
          className="image-lightbox__button"
          type="button"
          onClick={() => document.documentElement.requestFullscreen?.()}
        >
          Fullscreen
        </button>
        <button className="image-lightbox__button" type="button" onClick={() => setViewer(null)}>
          Close
        </button>
      </div>
      <div
        className="image-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
        onWheel={(event) => {
          event.preventDefault();
          setScale((value) => Math.min(4, Math.max(0.25, value + (event.deltaY < 0 ? 0.12 : -0.12))));
        }}
        onTouchStart={(event) => {
          if (event.touches.length === 2) {
            const [first, second] = Array.from(event.touches);
            pinchDistance.current = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
          }
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 2 || pinchDistance.current === null) return;
          event.preventDefault();
          const [first, second] = Array.from(event.touches);
          const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
          const delta = distance / pinchDistance.current;
          pinchDistance.current = distance;
          setScale((value) => Math.min(4, Math.max(0.25, value * delta)));
        }}
        onTouchEnd={() => {
          pinchDistance.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="image-lightbox__image"
          src={viewer.src}
          alt={viewer.alt}
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          draggable={false}
        />
      </div>
    </div>
  );
}
