"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/submissions",
    label: "Submissions",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/api/admin/stats`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setCount(d.total); })
      .catch(() => {});
    const t = setInterval(() => {
      fetch(`${API}/api/admin/stats`)
        .then((r) => r.json())
        .then((d) => { if (d.ok) setCount(d.total); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="fixed top-0 left-0 z-30 flex h-screen w-[240px] flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-2)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand)] text-[15px] font-extrabold text-white">
          B
        </div>
        <div>
          <p className="text-[14px] font-bold leading-tight">Survey Dashboard</p>
          <p className="text-[11px] text-[var(--color-text-muted)]">Analytics & Reports</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.icon}
              {item.label}
              {item.label === "Submissions" && count !== null && (
                <span className="ml-auto rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-3 py-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
          Open Survey ↗
        </a>
        <p className="mt-1 px-3 text-[10px] text-[var(--color-text-muted)]">Survey Analytics v2.0</p>
      </div>
    </aside>
  );
}
