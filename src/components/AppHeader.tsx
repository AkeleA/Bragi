"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/editor", label: "Editor" },
  { href: "/schedule", label: "Scheduling" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const themeLabel = mounted
    ? `Switch to ${nextTheme} mode`
    : "Toggle color mode";
  const logoSrc =
    mounted && resolvedTheme === "light"
      ? "/bragi_dark.png"
      : "/bragi_light.png";

  return (
    <header className="topbar">
      <Link className="brand" href="/editor" aria-label="Bragi editor home">
        <Image
          className="brand-logo"
          src={logoSrc}
          alt="Bragi"
          width={840}
          height={196}
          priority
        />
        <small>Video edits and scheduled posts</small>
      </Link>

      <button
        aria-controls="topbar-menu"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        className="icon-btn menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        className={menuOpen ? "topbar-menu open" : "topbar-menu"}
        id="topbar-menu"
      >
        <nav className="main-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              aria-current={pathname === item.href ? "page" : undefined}
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            aria-label={themeLabel}
            className="icon-btn theme-toggle"
            onClick={() => mounted && setTheme(nextTheme)}
            title={themeLabel}
            type="button"
          >
            {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          {status === "authenticated" ? (
            <button
              className="btn secondary"
              onClick={() => signOut()}
              title={session.user?.email ?? undefined}
              type="button"
            >
              Sign out
            </button>
          ) : (
            <Link className="btn primary" href="/sign-in">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.4 14.5A8.5 8.5 0 0 1 9.5 3.6a7 7 0 1 0 10.9 10.9Z" />
    </svg>
  );
}
