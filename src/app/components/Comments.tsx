"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock, LogOut, MessageCircle } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import type { CommentRecord } from "@/lib/comments/types";

type AuthUser = {
  userId?: string;
  provider: "github" | "google";
  providerUserId: string;
  name: string;
  email: string;
  avatar: string | null;
};

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function GoogleMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-900">
      G
    </span>
  );
}

function GitHubMark() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[9px] font-black text-white dark:bg-white dark:text-slate-950">
      GH
    </span>
  );
}

function UserAvatar({ user }: { user: AuthUser }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        user.name.slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

function CommentAvatar({ comment }: { comment: CommentRecord }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {comment.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={comment.avatarUrl} alt={comment.name} className="h-full w-full object-cover" />
      ) : (
        comment.name.slice(0, 1).toUpperCase()
      )}
    </div>
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
  const pathname = usePathname();
  const [comments, setComments] = useState<CommentRecord[]>(initialComments);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(initialComments.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((payload) => {
        if (active) setUser(payload.user || null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initialComments.length > 0) return;
    let active = true;
    fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`, { cache: "no-store" })
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, body }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit comment");
      setBody("");
      setMessage(
        language === "vi"
          ? "Bình luận đã được gửi và đang chờ duyệt."
          : "Your comment was submitted and is waiting for approval."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };
  const loginReturnTo = encodeURIComponent(`${pathname || "/"}#comments`);

  return (
    <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800" id="comments">
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
          {language === "vi" ? "Bình luận" : "Comments"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {comments.length} {language === "vi" ? "bình luận" : comments.length === 1 ? "comment" : "comments"}
        </p>
      </div>

      <div className="theme-card mb-8 overflow-hidden rounded-2xl border p-4 sm:p-5">
        {!user ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_17rem] lg:items-stretch">
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/35">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                {language === "vi" ? "Đăng nhập để tham gia bình luận" : "Sign in to join the conversation"}
              </div>
              <textarea
                disabled
                placeholder={language === "vi" ? "Đăng nhập để bình luận" : "Sign in to comment"}
                className="min-h-24 w-full resize-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700"
              />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <a
                href={`/api/auth/github?returnTo=${loginReturnTo}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/20 dark:border-slate-700 dark:bg-slate-50 dark:text-slate-950"
              >
                <GitHubMark />
                Continue with GitHub
              </a>
              <a
                href={`/api/auth/google?returnTo=${loginReturnTo}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <GoogleMark />
                Continue with Google
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.provider}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={language === "vi" ? "Viết bình luận" : "Write a comment"}
              className="min-h-28 w-full resize-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-700"
              required
            />
            {message && (
              <div className="flex items-start gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || body.trim().length < 2}
                className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-60"
              >
                {isSubmitting
                  ? language === "vi"
                    ? "Đang gửi..."
                    : "Submitting..."
                  : language === "vi"
                    ? "Gửi bình luận"
                    : "Submit comment"}
              </button>
            </div>
          </form>
        )}
      </div>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center dark:border-slate-800">
          <MessageCircle className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {language === "vi" ? "Chưa có bình luận được duyệt" : "No approved comments yet"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {language === "vi"
              ? "Hãy đăng nhập và để lại bình luận đầu tiên. Bình luận mới sẽ hiển thị sau khi duyệt."
              : "Be the first to comment. New comments appear after approval."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <article key={comment.id} className="flex gap-3">
              <CommentAvatar comment={comment} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">{comment.name}</h3>
                  <time className="text-xs text-slate-500">{formatDate(comment.createdAt, language)}</time>
                </div>
                <div
                  className="article-content prose mt-2 max-w-none text-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: comment.bodyHtml }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
