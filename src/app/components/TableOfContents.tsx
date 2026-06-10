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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    headingElements.forEach((element) => observer.observe(element));

    return () => {
      window.cancelAnimationFrame(updateFrame);
      observer.disconnect();
    };
  }, [contentSelector, headings]);

  return (
    <aside className="order-3 hidden w-64 lg:block">
      <div className="sticky top-24 space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-150">
          <List className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Mục lục
        </h3>

        {tocHeadings.length === 0 ? (
          <p className="text-xs text-gray-400">{emptyLabel}</p>
        ) : (
          <ul className="space-y-2.5 border-l border-gray-250 py-1 pl-4 text-xs dark:border-gray-800">
            {tocHeadings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (!element) return;

                    const yOffset = -80;
                    const y =
                      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }}
                  className={`block transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 ${
                    heading.level === 3 ? "pl-3" : ""
                  } ${
                    activeId === heading.id
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
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
