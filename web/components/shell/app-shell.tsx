"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MainNav } from "@web/components/navigation/main-nav";
import { useSession } from "@web/components/session/use-session";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, status, signIn, signOut } = useSession();

  return (
    <>
      <header className="app-header">
        <div className="shell-inner shell-header">
          <div className="brand-block">
            <Link href="/" className="brand-title">
              Biker Map
            </Link>
            <p className="brand-subtitle">웹 Shell / API / 세션 / 탐색 착수</p>
          </div>

          <div className="header-actions">
            <span className="session-pill">
              {status === "authenticated" ? session?.displayName : "비로그인"}
            </span>
            {status === "authenticated" ? (
              <button className="ghost-button" type="button" onClick={signOut}>
                로그아웃
              </button>
            ) : (
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  signIn({
                    userId: "mock-user-001",
                    displayName: "서연",
                    email: "seoyeon@biker-map.local"
                  })
                }>
                로그인 시뮬레이션
              </button>
            )}
          </div>
        </div>

        <div className="shell-inner shell-nav-row">
          <MainNav />
        </div>
      </header>

      <main className="shell-main">{children}</main>
    </>
  );
}
