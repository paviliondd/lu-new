"use client";

import Link from "next/link";
import type { Author } from "@/app/data";
import AuthorAvatar from "@/app/components/AuthorAvatar";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 3.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

function MemberCard({ member }: { member: Author }) {
  const socials = {
    linkedin: member.linkedin || undefined,
    github: member.github || undefined,
  };
  const hasSocials = Object.values(socials).some(Boolean);

  const socialLinks = [
    { key: "linkedin", href: socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { key: "github", href: socials.github, label: "GitHub", Icon: GithubIcon },
  ];

  return (
    <article className="theme-card group flex h-full flex-col items-center rounded-[20px] border theme-border px-5 pb-5 pt-7 text-center transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 rounded-full bg-gradient-to-br from-sky-400/55 to-teal-400/15 p-[3px]">
        <AuthorAvatar
          author={member}
          className="h-[88px] w-[88px] border-[2.5px] border-white bg-slate-100 shadow-sm dark:border-slate-900 dark:bg-slate-800"
          imageClassName="object-cover"
          sizes="88px"
        />
      </div>

      <h3 className="text-base font-bold text-slate-950 dark:text-white">{member.name}</h3>
      <p className="mt-1 text-[13px] font-semibold text-blue-600 dark:text-sky-400">
        {member.role_en || member.role}
      </p>
      {(member.description_en || member.description) && (
        <p className="mt-3 line-clamp-3 min-h-[60px] text-[13px] leading-[1.55] text-slate-500 dark:text-slate-400">
          {member.description_en || member.description}
        </p>
      )}

      {hasSocials && (
        <div className="mt-auto flex min-h-8 items-center justify-center gap-2.5 pt-4">
          {socialLinks.map(({ key, href, label, Icon }) =>
            href ? (
              <Link
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} ${label}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
            ) : null,
          )}
        </div>
      )}
    </article>
  );
}

export default function MeetTheTeamSection({ members }: { members: Author[] }) {
  return (
    <section className="border-b theme-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-3">
            <span className="h-px w-8 bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-sky-400">
              Our People
            </span>
            <span className="h-px w-8 bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            The Team Behind LinuxUnity
          </h2>
          <p className="mt-2 text-[15px] text-slate-500 dark:text-slate-400">
            Engineers, creators, and problem solvers.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
