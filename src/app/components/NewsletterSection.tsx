"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

interface NewsletterSectionProps {
  compact?: boolean;
}

export default function NewsletterSection({ compact = false }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputId = compact ? "footer-newsletter-email" : "homepage-newsletter-email";
  const errorId = `${emailInputId}-error`;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("Enter your email address to subscribe.");
      return;
    }
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: nextEmail }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Unable to subscribe");
      }

      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <section className="w-full lg:max-w-[17rem] lg:justify-self-end" aria-labelledby="footer-newsletter-title">
        <h2 id="footer-newsletter-title" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-950 dark:text-white">
          Subscribe for updates
        </h2>

        {subscribed ? (
          <div className="mt-4 flex min-h-11 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            Subscribed successfully!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} noValidate className="mt-3 flex w-full max-w-[17rem] items-center gap-2">
            <label htmlFor={emailInputId} className="sr-only">
              Email address
            </label>
            <input
              id={emailInputId}
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              placeholder="Your email address..."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={`h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-400 dark:focus:border-rose-400 dark:focus:ring-rose-400/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-500/20 dark:border-slate-700/80 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"}`}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Subscribe"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {error && (
          <p id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="border-b theme-border py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border theme-border bg-slate-50/80 p-8 text-slate-950 shadow-sm transition-colors duration-300 dark:bg-[#090d16] dark:text-white sm:p-12">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Stay in the loop
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Get notified when a new Linux & DevOps guide is published.
            </p>

            {subscribed ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold">
                  Subscribed successfully! Thank you for following.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3 sm:mt-8 sm:flex-row">
                <label htmlFor={emailInputId} className="sr-only">
                  Email address
                </label>
                <input
                  id={emailInputId}
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  placeholder="Your email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-400 dark:focus:border-rose-400 dark:focus:ring-rose-400/20" : "border-slate-300 focus:border-teal-600 focus:ring-teal-500/20 dark:border-slate-700/80 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"}`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0f9c98] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:w-auto"
                >
                  <span>Subscribe</span>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}

            {error && (
              <p id={errorId} role="alert" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
