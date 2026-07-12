"use client";

import { useEffect, useState } from "react";
import type { Post } from "../data";
import { useLanguage } from "./LanguageProvider";

export function usePublishedPosts(initialPosts: Post[]) {
  const { language } = useLanguage();
  const [loadedPosts, setLoadedPosts] = useState<{
    language: typeof language;
    posts: Post[];
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const response = await fetch(`/api/posts?locale=${language}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload = (await response.json()) as Post[] | { docs?: Post[] };
        const posts = Array.isArray(payload) ? payload : payload.docs || [];
        if (posts.length === 0 && initialPosts.length > 0) return;

        if (isMounted) {
          setLoadedPosts({ language, posts });
        }
      } catch {
        // Keep the local published-post fallback when the headless CMS is unavailable.
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialPosts, language]);

  return loadedPosts?.language === language ? loadedPosts.posts : initialPosts;
}
