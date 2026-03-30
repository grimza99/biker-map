"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@shared/lib";
import { MainNav } from "@widgets/main-nav";
import { useSession } from "@features/session";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, status, signIn, signOut } = useSession();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--panel)] backdrop-blur-md">
        <div className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-wrap items-center justify-between gap-4 py-4">
          <div className="grid gap-1">
            <Link href="/" className="text-lg font-extrabold tracking-[-0.02em]">
              Biker Map
            </Link>
            <p className="m-0 text-sm text-[color:var(--muted)]">웹 Shell / API / 세션 / 탐색 착수</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel-solid)] px-3 py-2 text-sm">
              {status === "authenticated" ? session?.displayName : "비로그인"}
            </span>
            {status === "authenticated" ? (
              <button
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-solid)] px-3.5 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5"
                type="button"
                onClick={signOut}>
                로그아웃
              </button>
            ) : (
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--text)] transition duration-150 ease-out hover:-translate-y-0.5",
                  "bg-[color:var(--accent)] shadow-[0_10px_24px_var(--shadow-accent)]"
                )}
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

        <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
          <MainNav />
        </div>
      </header>

      <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-6 pb-14">{children}</main>
    </>
  );
}
