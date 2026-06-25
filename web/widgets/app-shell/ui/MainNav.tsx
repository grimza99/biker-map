"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PATHS } from "@package-shared/constants";

import { useSession } from "@features/session";
import { Button } from "@shared/ui";

const navItems = [
  { href: PATHS.map.entry, label: "지도" },
  { href: PATHS.community.entry, label: "커뮤니티" },
  { href: PATHS.route.list, label: "라이딩 경로" },
  { href: PATHS.me, label: "내 정보" },
];

export function MainNav() {
  const pathname = usePathname();
  const { session } = useSession();
  const isAdmin = session?.role === "admin";

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
              asChild
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </Button>
          );
        })}
        {isAdmin ? (
          <Button
            variant="underline"
            size="lg"
            selected={
              pathname === PATHS.admin || pathname.startsWith(PATHS.admin)
            }
          >
            <Link
              href={PATHS.admin}
              aria-current={
                pathname === PATHS.admin || pathname.startsWith(PATHS.admin)
                  ? "page"
                  : undefined
              }
              className="text-accent"
            >
              관리자
            </Link>
          </Button>
        ) : null}
      </nav>
    </div>
  );
}
