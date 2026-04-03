"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "@features/session";
import { Button } from "@shared/ui";
import { NotificationBell } from "@widgets/notification-bell";

const navItems = [
  { href: "/map", label: "지도" },
  { href: "/community", label: "커뮤니티" },
  { href: "/favorites", label: "즐겨찾기" },
  { href: "/me", label: "내 정보" },
];

export function MainNav() {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <div className="flex items-center gap-2">
      <nav className="flex flex-1 gap-2 overflow-x-auto" aria-label="주요 탐색">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Button
              key={item.href}
              variant="underline"
              size="lg"
              selected={active}
              className="text-accent"
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {status !== "authenticated" ? <NotificationBell /> : null}
    </div>
  );
}
