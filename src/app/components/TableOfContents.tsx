"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

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

  useEffect(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) {
      return;
    }

    const seenIds = new Set<string>();
    const headingElements = Array.from(contentElement.querySelectorAll("h2, h3"));
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

    let ticking = false;

    const updateActiveHeading = () => {
      const readingLine = window.scrollY + 160;
      let currentId = headingElements[0]?.id ?? "";

      headingElements.forEach((heading) => {
        const absoluteTop =
          (heading as HTMLElement).getBoundingClientRect().top + window.scrollY;
        if (absoluteTop <= readingLine) {
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

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveHeading();
        ticking = false;
      });
    };

    updateActiveHeading();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(updateFrame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [contentSelector, headings]);

  return (
    <aside className="order-3 hidden w-64 lg:block">
      <div className="sticky top-24 rounded-xl border theme-border bg-white/70 p-4 backdrop-blur dark:bg-slate-900/45">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-slate-100">
          <List className="h-4 w-4 text-teal-700 dark:text-emerald-300" />
          {title}
        </h3>

        {tocHeadings.length === 0 ? (
          <p className="mt-4 text-xs text-gray-400">{emptyLabel}</p>
        ) : (
          <ul className="mt-4 space-y-2.5 border-l theme-border py-1 pl-4 text-xs">
            {tocHeadings.map((heading) => (
              <li key={heading.id}>
                <a
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
                  className={`block leading-5 transition-colors duration-200 hover:text-teal-700 dark:hover:text-emerald-300 ${
                    heading.level === 3 ? "pl-3" : ""
                  } ${
                    activeId === heading.id
                      ? "font-semibold text-teal-700 dark:text-emerald-300"
                      : "text-slate-500 dark:text-slate-400"
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
