"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

interface NewsletterSectionProps {
  compact?: boolean;
}

export default function NewsletterSection({ compact = false }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail || isSubmitting) return;

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

  return (
    <section className={compact ? "border-b theme-border py-8 sm:py-10" : "border-b theme-border py-10 sm:py-14"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-2xl border theme-border bg-slate-50/80 text-slate-950 shadow-sm transition-colors duration-300 dark:bg-[#090d16] dark:text-white ${compact ? "p-6 sm:p-8" : "p-8 sm:p-12"}`}>
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />

          <div className={`relative z-10 mx-auto ${compact ? "max-w-3xl" : "max-w-2xl text-center"}`}>
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
              <form onSubmit={handleSubscribe} className={`mt-6 flex flex-col items-center gap-3 sm:flex-row ${compact ? "max-w-xl" : "mx-auto max-w-md sm:mt-8"}`}>
                <input
                  type="email"
                  required
                  placeholder="Your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700/80 focus:border-teal-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-teal-500/20 dark:focus:ring-emerald-400/20 outline-none text-sm transition"
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
              <p role="alert" className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
