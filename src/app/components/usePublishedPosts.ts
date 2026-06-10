"use client";

import { useEffect, useState } from "react";
import type { Post } from "../data";
import { useLanguage } from "./LanguageProvider";

export function usePublishedPosts(initialPosts: Post[]) {
  const { language } = useLanguage();
  const [publishedPosts, setPublishedPosts] = useState(initialPosts);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const response = await fetch(`/api/posts?locale=${language}`);
        if (!response.ok) return;

        const posts = (await response.json()) as Post[];
        if (isMounted) {
          setPublishedPosts(posts);
        }
      } catch {
        // Keep the local published-post fallback when the headless CMS is unavailable.
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return publishedPosts;
}
