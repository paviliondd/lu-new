"use client";

import CustomImage from "./CustomImage";
import type { Author, Post } from "@/app/data";

interface AuthorAvatarProps {
  author?: Author;
  post?: Pick<Post, "authorAvatar" | "authorName">;
  className?: string;
  imageClassName?: string;
}

function isImageSource(value?: string | null) {
  return Boolean(value && /^(https?:\/\/|\/|data:image\/)/i.test(value));
}

export function getAuthorDisplay(author?: Author, post?: Pick<Post, "authorAvatar" | "authorName">) {
  const name = post?.authorName || author?.name || "LinuxUnity";
  const avatar = post?.authorAvatar || author?.avatarUrl || author?.avatar || "";
  const initial = (name.trim()[0] || author?.avatar || "L").toUpperCase();

  return {
    name: name.split(" (")[0],
    avatar,
    initial,
    hasImage: isImageSource(avatar),
  };
}

export default function AuthorAvatar({
  author,
  post,
  className = "h-8 w-8",
  imageClassName = "",
}: AuthorAvatarProps) {
  const display = getAuthorDisplay(author, post);

  if (display.hasImage) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
        <CustomImage
          src={display.avatar}
          alt={display.name}
          fill
          sizes="48px"
          className={`object-cover ${imageClassName}`}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-[10px] font-extrabold text-slate-950 ${className}`}
      aria-label={display.name}
    >
      {display.initial}
    </span>
  );
}
