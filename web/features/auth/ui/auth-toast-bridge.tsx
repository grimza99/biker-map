"use client";

import { TOAST_MESSAGE } from "@package-shared/constants/toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useToast } from "@shared/ui";

const authToastMessages = {
  "login-success": TOAST_MESSAGE.AUTH.LOGIN.S,
  "signup-success": TOAST_MESSAGE.AUTH.SIGNIN.S,
  "logout-success": "로그아웃되었습니다.",
} as const;

type AuthToastKey = keyof typeof authToastMessages;

export function AuthToastBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const toast = searchParams.get("toast");

  useEffect(() => {
    if (!toast || !isAuthToastKey(toast)) {
      return;
    }

    showToast({
      tone: "success",
      title: authToastMessages[toast],
    });

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("toast");
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, showToast, toast]);

  return null;
}

function isAuthToastKey(value: string): value is AuthToastKey {
  return value in authToastMessages;
}
