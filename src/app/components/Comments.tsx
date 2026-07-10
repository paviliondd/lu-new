"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h6.47a5.53 5.53 0 0 1-2.4 3.63v3.01h3.88c2.27-2.09 3.54-5.17 3.54-8.66Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.21 7.21 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.78 1.26 5.39l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.53 11.53 0 0 0 12 0 12 12 0 0 0 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.38-3.88-1.38-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.9 10.9 0 0 1 12 6c.98 0 1.94.13 2.85.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.21c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
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
  const [replyTo, setReplyTo] = useState<CommentRecord | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
        body: JSON.stringify({ postSlug, body, parentId: replyTo?.id || null }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit comment");
      setBody("");
      setReplyTo(null);
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
  const startReply = (comment: CommentRecord) => {
    setReplyTo(comment);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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

      <div className="theme-card mb-8 overflow-hidden rounded-xl border p-4 sm:p-5">
        {!user ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_14.5rem] lg:items-stretch">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/35">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                {language === "vi" ? "Đăng nhập để tham gia bình luận" : "Sign in to join the conversation"}
              </div>
              <textarea
                disabled
                placeholder={language === "vi" ? "Đăng nhập để bình luận" : "Sign in to comment"}
                className="min-h-24 w-full resize-none rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700"
              />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <a
                href={`/api/auth/github?returnTo=${loginReturnTo}`}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              >
                <GitHubMark />
                Continue with GitHub
              </a>
              <a
                href={`/api/auth/google?returnTo=${loginReturnTo}`}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              >
                <GoogleMark />
                Continue with Google
              </a>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} className="space-y-4">
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
                className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
            {replyTo && (
              <div className="flex items-center justify-between gap-3 rounded-lg border theme-border bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
                <span className="min-w-0 truncate theme-muted">
                  {language === "vi" ? "Đang trả lời" : "Replying to"}{" "}
                  <strong className="text-slate-800 dark:text-slate-100">{replyTo.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="shrink-0 rounded-md px-2 py-1 font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {language === "vi" ? "Hủy" : "Cancel"}
                </button>
              </div>
            )}
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={language === "vi" ? "Viết bình luận" : "Write a comment"}
              className="min-h-28 w-full resize-none rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:focus:border-emerald-400"
              required
            />
            {message && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200" role="status">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {error && <p className="text-xs font-semibold text-red-500" role="alert">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || body.trim().length < 2}
                className="min-h-11 rounded-lg bg-slate-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
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
        <div className="h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center dark:border-slate-800">
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
            <article key={comment.id} className="theme-card flex gap-3 rounded-xl border p-4">
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
                {user && (
                  <button
                    type="button"
                    onClick={() => startReply(comment)}
                    className="mt-3 inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                  >
                    {language === "vi" ? "Trả lời" : "Reply"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
