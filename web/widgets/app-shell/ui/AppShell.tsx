"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { APP_NAME, PATHS } from "@package-shared/constants";

import { Button, Profile } from "@/shared";
import { useSession } from "@features/session";
import {
  NotificationBell,
  NotificationsRealtimeBridge,
} from "@widgets/notification-bell";
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
      <header className="sticky top-0 z-20 border-b border-border bg-panel backdrop-blur-md">
        <div className="mx-auto flex w-[min(1280px,calc(100%-32px))] items-center justify-around gap-4 py-4">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-[-0.02em] whitespace-nowrap"
          >
            {APP_NAME}
          </Link>
          <div className="mx-auto w-full flex">
            <MainNav />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {session && status === "authenticated" ? (
              <div className="flex gap-4 w-fit items-center">
                <NotificationsRealtimeBridge />
                <NotificationBell />
                <Profile
                  name={session?.name ? session.name : ""}
                  href={PATHS.me}
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
              <Button asChild>
                <Link href={PATHS.auth} className="whitespace-nowrap">
                  로그인
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
      <Footer />
    </>
  );
}
