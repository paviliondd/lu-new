"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  headings: TocHeading[];
  contentSelector?: string;
  emptyLabel: string;
  title: string;
}

export function MobileTableOfContents({ headings, emptyLabel, title }: TableOfContentsProps) {
  return (
    <details className="article-reading-frame theme-card group rounded-xl border 2xl:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-slate-950 marker:content-none dark:text-slate-100">
        <List className="h-4 w-4 text-teal-700 dark:text-emerald-300" aria-hidden="true" />
        <span>{title}</span>
        <ChevronDown className="ml-auto h-4 w-4 theme-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t theme-border px-4 py-3">
        {headings.length === 0 ? (
          <p className="text-xs text-gray-400">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2 border-l theme-border pl-4 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`block leading-6 text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline focus-visible:rounded-sm dark:text-slate-300 dark:hover:text-emerald-300 ${
                    heading.level === 3 ? "pl-3" : ""
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function slugifyHeading(text: string, index: number) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `heading-${index}`
  );
}

export default function TableOfContents({
  headings,
  contentSelector = ".article-content",
  emptyLabel,
  title,
}: TableOfContentsProps) {
  const [tocHeadings, setTocHeadings] = useState<TocHeading[]>(headings);
  const [activeId, setActiveId] = useState("");
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const tocContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) {
      return;
    }

    const seenIds = new Set<string>();
    const headingElements = Array.from(
      contentElement.querySelectorAll<HTMLElement>("h2, h3"),
    );
    const headingList = headingElements
      .map((element, index) => {
        const text = element.textContent?.trim() || "";
        if (!text) return null;

        const baseId = headings[index]?.id || slugifyHeading(text, index);
        let id = baseId;
        let duplicateIndex = 2;
        while (seenIds.has(id)) {
          id = `${baseId}-${duplicateIndex}`;
          duplicateIndex += 1;
        }

        seenIds.add(id);
        element.id = id;

        return {
          id,
          text,
          level: element.tagName.toLowerCase() === "h3" ? 3 : 2,
        } satisfies TocHeading;
      })
      .filter((heading): heading is TocHeading => Boolean(heading));

    const updateFrame = window.requestAnimationFrame(() => {
      setTocHeadings(headingList.length ? headingList : headings);
    });

    const updateActiveHeading = () => {
      const readingLine = 160;
      let currentId = headingElements[0]?.id ?? "";

      headingElements.forEach((heading) => {
        if (heading.getBoundingClientRect().top <= readingLine) {
          currentId = heading.id;
        }
      });

      const isAtPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;

      if (isAtPageEnd) {
        currentId = headingElements[headingElements.length - 1]?.id ?? currentId;
      }

      setActiveId(currentId);
    };

    const observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: "-160px 0px -50% 0px",
      threshold: [0, 1],
    });
    headingElements.forEach((heading) => observer.observe(heading));
    updateActiveHeading();

    return () => {
      window.cancelAnimationFrame(updateFrame);
      observer.disconnect();
    };
  }, [contentSelector, headings]);

  useEffect(() => {
    if (!activeId) return;

    const frame = window.requestAnimationFrame(() => {
      const container = tocContainerRef.current;
      const link = linkRefs.current.get(activeId);
      if (!container || !link) return;

      const containerBounds = container.getBoundingClientRect();
      const linkBounds = link.getBoundingClientRect();
      const topOverflow = linkBounds.top - containerBounds.top;
      const bottomOverflow = linkBounds.bottom - containerBounds.bottom;
      const scrollDelta = topOverflow < 0
        ? topOverflow - 8
        : bottomOverflow > 0
          ? bottomOverflow + 8
          : 0;

      if (scrollDelta === 0) return;
      container.scrollTo({
        top: container.scrollTop + scrollDelta,
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId]);

  return (
    <aside className="hidden w-full pl-8 2xl:col-start-3 2xl:row-start-1 2xl:block">
      <div ref={tocContainerRef} className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto py-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>

        {tocHeadings.length === 0 ? (
          <p className="mt-4 text-xs text-gray-400">{emptyLabel}</p>
        ) : (
          <ul className="mt-3 space-y-1 border-l border-slate-200 py-1 text-sm dark:border-slate-700">
            {tocHeadings.map((heading) => (
              <li key={heading.id}>
                <a
                  ref={(element) => {
                    if (element) linkRefs.current.set(heading.id, element);
                    else linkRefs.current.delete(heading.id);
                  }}
                  href={`#${heading.id}`}
                  aria-current={activeId === heading.id ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveId(heading.id);
                    const element = document.getElementById(heading.id);
                    if (!element) return;

                    const yOffset = -80;
                    const y =
                      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }}
                  className={`-ml-px block border-l-2 py-1.5 pl-4 leading-5 transition-colors duration-200 hover:border-teal-400 hover:text-teal-700 dark:hover:border-emerald-400 dark:hover:text-emerald-300 ${
                    heading.level === 3 ? "pl-7 text-[13px]" : ""
                  } ${
                    activeId === heading.id
                      ? "border-teal-600 font-semibold text-teal-700 dark:border-emerald-400 dark:text-emerald-300"
                      : "border-transparent text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
