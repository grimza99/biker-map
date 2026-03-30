"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@shared/lib";
import { NotificationBell } from "@widgets/notification-bell";
import { useSession } from "@features/session";

const navItems = [
  { href: "/map", label: "지도" },
  { href: "/community", label: "커뮤니티" },
  { href: "/favorites", label: "즐겨찾기" },
  { href: "/me", label: "내 정보" }
];

export function MainNav() {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <div className="flex items-start gap-2">
      <nav className="min-w-0 flex flex-1 gap-2 overflow-x-auto pb-3" aria-label="주요 탐색">
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
                  ? "border-accent bg-accent text-text shadow-[0_10px_24px_var(--shadow-accent)]"
                  : "border-border bg-panel-solid text-text hover:border-accent hover:text-accent-strong"
              )}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {status === "authenticated" ? (
        <div className="shrink-0 pt-0.5">
          <NotificationBell />
        </div>
      ) : null}
    </div>
  );
}
