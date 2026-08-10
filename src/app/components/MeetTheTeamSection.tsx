"use client";

import React from "react";
import { team } from "@/app/data";
import AuthorAvatar from "@/app/components/AuthorAvatar";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function MeetTheTeamSection() {
  const { language } = useLanguage();
  const members = [team.peterparker, team.huynhminhthai].filter(Boolean);

  return (
    <section className="py-12 sm:py-16 border-b theme-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="theme-card relative overflow-hidden rounded-2xl border theme-border p-8 sm:p-12 text-center transition-all">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Meet the team behind the journey
            </h2>
            <p className="mt-2 text-base font-serif italic text-slate-600 dark:text-slate-400">
              {language === "vi"
                ? '"Chúng tôi viết những gì đang dùng mỗi ngày"'
                : '"We write what we use every day"'}
            </p>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto items-center">
            {members.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center p-6 rounded-xl border theme-border bg-slate-50/50 dark:bg-slate-900/50 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4">
                  <AuthorAvatar
                    author={member}
                    className="h-24 w-24 border-2 border-teal-500/30 dark:border-emerald-400/40 shadow-md"
                    imageClassName="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-teal-700 dark:text-emerald-400">
                  {language === "vi" ? member.role : member.role_en || member.role}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                  {language === "vi" ? member.description : member.description_en || member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
