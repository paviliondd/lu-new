"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";

const links = [
  { label: "Blog", href: "https://linuxunity.com" },
  { label: "Projects", href: "/", internal: true },
  { label: "About", href: "https://linuxunity.com/about" },
];

export default function ProjectHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="project-header">
      <div className="project-shell project-header__inner">
        <a className="project-brand" href="https://linuxunity.com" aria-label="LinuxUnity home">
          <Image src="/images/linuxunity-penguin-logo.png" alt="" aria-hidden width={32} height={32} priority />
          <span>Linux<span className="project-brand__accent">Unity</span></span>
        </a>
        <nav className="project-nav" aria-label="Project navigation">
          {links.map((link) => <Link key={link.label} href={link.href} aria-current={link.internal ? "page" : undefined}>{link.label}</Link>)}
          <span className="project-theme-toggle"><ThemeToggle /></span>
        </nav>
        <button className="project-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="project-mobile-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
        </button>
      </div>
      <nav id="project-mobile-navigation" className="project-shell project-mobile-nav" data-open={open} aria-label="Mobile project navigation">
        {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <span className="project-mobile-theme"><span>Theme</span><ThemeToggle /></span>
      </nav>
    </header>
  );
}
