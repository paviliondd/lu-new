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
  const shouldRewriteLegacyAssets = process.env.NEXT_PUBLIC_REWRITE_LEGACY_ASSETS === "true";
  const origin = url.origin.replace(/\/$/, "");
  const isLegacyOrigin = legacyAssetOrigins.includes(origin);

  if (!assetOrigin || !shouldRewriteLegacyAssets || !isLegacyOrigin) {
    return null;
  }

  return `${trimTrailingSlash(assetOrigin)}${url.pathname}${url.search}${url.hash}`;
}

function normalizeAssetUrl(value: string, assetOrigin: string, legacyAssetOrigins: string[]) {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return value;

  const normalizedOrigin = trimTrailingSlash(assetOrigin);
  if (value.startsWith("//")) {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
    return `${protocol}${value}`;
  }

  if (value.startsWith("/uploads/") || value.startsWith("/images/")) {
    return normalizedOrigin ? `${normalizedOrigin}${value}` : value;
  }

  try {
    const url = new URL(value, normalizedOrigin || window.location.origin);
    const legacyUrl = normalizeLegacyAssetUrl(url, normalizedOrigin, legacyAssetOrigins);
    if (legacyUrl) return legacyUrl;

    if (url.hostname === "localhost") {
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
  const [viewer, setViewer] = useState<{ index: number; images: Array<{ src: string; alt: string }> } | null>(null);
  const [scale, setScale] = useState(1);
  const pinchDistance = useRef<number | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const assetOrigin = getAssetOrigin(assetBase);
    const images = Array.from(container.querySelectorAll("img"));
    const cleanupHandlers: Array<() => void> = [];

    const galleryItems: Array<{ src: string; alt: string }> = [];

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

      const galleryIndex = galleryItems.push({
        src: image.currentSrc || image.src,
        alt: image.alt || "Article image",
      }) - 1;

      const handleError = () => {
        if (image.dataset.fallbackApplied === "true") return;

        image.removeAttribute("srcset");
        image.dataset.fallbackApplied = "true";
        image.classList.add("article-image--fallback");
        image.alt = image.alt || "LinuxUnity image unavailable";
        image.src = "/images/linuxunity-placeholder.svg";
      };
      const handleOpen = (event?: MouseEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        setScale(1);
        galleryItems[galleryIndex] = {
          src: image.currentSrc || image.src,
          alt: image.alt || "Article image",
        };
        setViewer({ index: galleryIndex, images: galleryItems });
      };
      const parentAnchor = image.closest("a");
      const handleAnchorOpen = (event: MouseEvent) => {
        handleOpen(event);
      };

      image.addEventListener("error", handleError, { once: true });
      image.addEventListener("click", handleOpen);
      parentAnchor?.addEventListener("click", handleAnchorOpen);
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
        parentAnchor?.removeEventListener("click", handleAnchorOpen);
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
      if (event.key === "ArrowRight") {
        setScale(1);
        setViewer((current) =>
          current ? { ...current, index: (current.index + 1) % current.images.length } : current
        );
      }
      if (event.key === "ArrowLeft") {
        setScale(1);
        setViewer((current) =>
          current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewer]);

  if (!viewer) return null;
  const activeImage = viewer.images[viewer.index];
  const hasMultipleImages = viewer.images.length > 1;
  const showNext = () => {
    setScale(1);
    setViewer((current) =>
      current ? { ...current, index: (current.index + 1) % current.images.length } : current
    );
  };
  const showPrevious = () => {
    setScale(1);
    setViewer((current) =>
      current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : current
    );
  };

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
        {hasMultipleImages && (
          <>
            <button className="image-lightbox__button" type="button" onClick={showPrevious}>
              Prev
            </button>
            <button className="image-lightbox__button" type="button" onClick={showNext}>
              Next
            </button>
          </>
        )}
        <button className="image-lightbox__button image-lightbox__button--close" type="button" aria-label="Close image viewer" onClick={() => setViewer(null)}>
          X
        </button>
      </div>
      <div
        className="image-lightbox__stage"
        onClick={() => setViewer(null)}
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
          src={activeImage.src}
          alt={activeImage.alt}
          style={{ transform: `scale(${scale})` }}
          onClick={(event) => event.stopPropagation()}
          draggable={false}
        />
      </div>
    </div>
  );
}
