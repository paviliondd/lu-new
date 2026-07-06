"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageCircle, Reply } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import type { CommentRecord } from "@/lib/comments/types";

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CommentForm({
  postSlug,
  parentId,
  onCreated,
}: {
  postSlug: string;
  parentId?: string | null;
  onCreated: (comment: CommentRecord) => void;
}) {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, parentId, name, avatarUrl, body, website }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to post comment");
      onCreated(payload.comment);
      setBody("");
      if (!parentId) setAvatarUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={language === "vi" ? "Tên của bạn" : "Your name"}
          className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700"
          required
        />
        <input
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder={language === "vi" ? "URL avatar (tùy chọn)" : "Avatar URL (optional)"}
          className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700"
        />
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={language === "vi" ? "Viết bình luận bằng Markdown cơ bản..." : "Write a comment with basic Markdown..."}
        className="min-h-28 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700"
        required
      />
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-60"
      >
        {isSubmitting ? (language === "vi" ? "Đang gửi..." : "Posting...") : language === "vi" ? "Gửi bình luận" : "Post comment"}
      </button>
    </form>
  );
}

function CommentItem({
  comment,
  childrenByParent,
  onReply,
}: {
  comment: CommentRecord;
  childrenByParent: Map<string, CommentRecord[]>;
  onReply: (comment: CommentRecord) => void;
}) {
  const { language } = useLanguage();
  const [showReply, setShowReply] = useState(false);

  return (
    <article className="border-l border-slate-200 pl-4 dark:border-slate-800">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-400/20 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
          {comment.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.avatarUrl} alt={comment.name} className="h-full w-full object-cover" />
          ) : (
            comment.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{comment.name}</h3>
            <time className="text-[11px] text-slate-500">{formatDate(comment.createdAt, language)}</time>
          </div>
          <div
            className="article-content prose mt-2 max-w-none text-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: comment.bodyHtml }}
          />
          <button
            type="button"
            onClick={() => setShowReply((value) => !value)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-300"
          >
            <Reply className="h-3.5 w-3.5" />
            {language === "vi" ? "Trả lời" : "Reply"}
          </button>
          {showReply && (
            <div className="mt-3">
              <CommentForm
                postSlug={comment.postSlug}
                parentId={comment.id}
                onCreated={(created) => {
                  onReply(created);
                  setShowReply(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
      {(childrenByParent.get(comment.id) || []).length > 0 && (
        <div className="mt-4 space-y-4">
          {(childrenByParent.get(comment.id) || []).map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              childrenByParent={childrenByParent}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function Comments({
  postSlug,
  initialComments = [],
}: {
  postSlug: string;
  initialComments?: CommentRecord[];
}) {
  const { language } = useLanguage();
  const [comments, setComments] = useState<CommentRecord[]>(initialComments);
  const [isLoading, setIsLoading] = useState(initialComments.length === 0);

  useEffect(() => {
    if (initialComments.length > 0) return;
    let active = true;
    fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`)
      .then((response) => (response.ok ? response.json() : { comments: [] }))
      .then((payload) => {
        if (active) setComments(payload.comments || []);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialComments.length, postSlug]);

  const roots = useMemo(() => comments.filter((comment) => !comment.parentId), [comments]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, CommentRecord[]>();
    comments.forEach((comment) => {
      if (!comment.parentId) return;
      map.set(comment.parentId, [...(map.get(comment.parentId) || []), comment]);
    });
    return map;
  }, [comments]);

  const addLocalComment = (comment: CommentRecord) => {
    setComments((current) => [...current, comment]);
  };

  return (
    <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800" id="comments">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
          {language === "vi" ? "Bình luận" : "Comments"}
        </h2>
      </div>

      <div className="theme-card mb-6 rounded-xl border p-4">
        <CommentForm postSlug={postSlug} onCreated={addLocalComment} />
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ) : roots.length === 0 ? (
        <p className="theme-muted text-sm">
          {language === "vi" ? "Chưa có bình luận nào." : "No comments yet."}
        </p>
      ) : (
        <div className="space-y-6">
          {roots.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              childrenByParent={childrenByParent}
              onReply={addLocalComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}
