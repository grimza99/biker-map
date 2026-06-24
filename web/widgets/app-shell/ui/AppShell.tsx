"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Profile } from "@/shared";
import { useSession } from "@features/session";
import { cn } from "@shared/lib";
import { NotificationsRealtimeBridge } from "@widgets/notification-bell";
import { Footer } from "./Footer";
import { MainNav } from "./MainNav";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut, status } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/auth?toast=logout-success");
  }

  return (
    <>
      {status === "authenticated" ? <NotificationsRealtimeBridge /> : null}
      <header className="sticky top-0 z-20 border-b border-border bg-panel backdrop-blur-md">
        <div className="mx-auto flex w-[min(1120px,calc(100%-32px))] flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-[-0.02em]">
            Biker Map
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {session && status === "authenticated" ? (
              <div className="flex gap-4 w-fit">
                <Profile
                  name={session?.name ? session.name : ""}
                  href="/me"
                  avatarUrl={session?.avatarUrl}
                />
                <div>
                  <button
                    onClick={() => void handleSignOut()}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-panel-solid px-3.5 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5 whitespace-nowrap"
                    type="button"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm font-medium text-text transition duration-150 ease-out hover:-translate-y-0.5",
                  "bg-accent shadow-[0_10px_24px_var(--shadow-accent)]"
                )}
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto w-[min(1120px,calc(100%-32px))]">
          <MainNav />
        </div>
      </header>
      {children}
      <Footer />
    </>
  );
}
