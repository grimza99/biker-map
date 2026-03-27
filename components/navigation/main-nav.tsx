"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <nav className="main-nav" aria-label="주요 탐색">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "nav-link nav-link-active" : "nav-link"}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
