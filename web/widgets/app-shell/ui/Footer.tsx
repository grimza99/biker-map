"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAME, PATHS } from "@package-shared/constants";
import { Button } from "@shared/ui";

const footerPolicyItems = [
  { href: PATHS.policy.terms, label: "이용약관", id: "policy-terms" },
  {
    href: PATHS.policy.privacy,
    label: "개인정보처리방침",
    id: "policy-privacy",
  },
  {
    href: PATHS.policy.location,
    label: "위치정보 약관",
    id: "policy-location",
  },
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="py-12 border-t-border border-t px-8">
      <div
        className="w-full flex flex-row overflow-x-auto items-center justify-between"
        aria-label="페이지 하단 정책"
      >
        <div className="flex flex-col gap-2">
          <strong className="text-muted text-xl">{APP_NAME}</strong>
          <strong className="text-muted">
            © 2026 BikerMap. All rights reserved.
          </strong>
        </div>
        <div className="flex ">
          {footerPolicyItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Button
                key={item.id}
                variant="underline"
                size="sm"
                selected={active}
                className="text-muted"
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
