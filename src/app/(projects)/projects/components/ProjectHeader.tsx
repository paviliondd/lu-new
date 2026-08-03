"use client";

import Image from "next/image";
import Link from "next/link";
import { Code2, Menu, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const links = [
  { label: "Projects", href: "/", internal: true },
  { label: "Blog", href: "https://linuxunity.com" },
  { label: "About", href: "https://linuxunity.com/about" },
];

export default function ProjectHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="project-header">
      <div className="project-shell project-header__inner">
        <Link className="project-brand" href="/" aria-label="LinuxUnity Projects home">
          <Image src="/images/linuxunity-penguin-logo.png" alt="" aria-hidden width={32} height={32} priority />
          <span>Linux<span className="project-brand__accent">Unity</span></span>
        </Link>
        <nav className="project-nav" aria-label="Project navigation">
          {links.map((link) => <Link key={link.label} href={link.href} aria-current={link.internal ? "page" : undefined}>{link.label}</Link>)}
          <a className="project-nav__github" href={siteConfig.social.github} aria-label="LinuxUnity repository on GitHub"><Code2 aria-hidden size={18} /></a>
        </nav>
        <button className="project-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="project-mobile-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
        </button>
      </div>
      <nav id="project-mobile-navigation" className="project-shell project-mobile-nav" data-open={open} aria-label="Mobile project navigation">
        {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <a href={siteConfig.social.github} onClick={() => setOpen(false)}>GitHub</a>
      </nav>
    </header>
  );
}
