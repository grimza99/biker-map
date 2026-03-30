"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@shared/lib";

const navItems = [
  { href: "/map", label: "지도" },
  { href: "/community", label: "커뮤니티" },
  { href: "/favorites", label: "즐겨찾기" },
  { href: "/notifications", label: "알림" },
  { href: "/me", label: "내 정보" }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-3" aria-label="주요 탐색">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex flex-none items-center rounded-full border px-3.5 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
              active
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_10px_24px_rgba(41,95,84,0.18)]"
                : "border-[color:var(--border)] bg-white/75 text-[color:var(--text)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
            )}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
