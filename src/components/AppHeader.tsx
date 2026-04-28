"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/editor", label: "Editor" },
  { href: "/schedule", label: "Scheduling" }
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <header className="topbar">
      <Link className="brand" href="/editor" aria-label="Bragi editor home">
        <span className="brand-mark" aria-hidden="true">
          B
        </span>
        <span>
          <strong>Bragi</strong>
          <small>Video edits and scheduled posts</small>
        </span>
      </Link>

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
          className="btn secondary"
          onClick={() => mounted && setTheme(nextTheme)}
          type="button"
        >
          {mounted && resolvedTheme === "dark" ? "Light" : "Dark"}
        </button>
        {status === "authenticated" ? (
          <button className="btn secondary" onClick={() => signOut()} type="button">
            {session.user?.email ?? "Sign out"}
          </button>
        ) : (
          <button className="btn primary" onClick={() => signIn()} type="button">
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
