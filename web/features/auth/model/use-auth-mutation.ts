"use client";

import { API_PATHS, TOAST_MESSAGE, type AuthResponseData } from "@package-shared/index";
import type { LoginBody, SignUpBody } from "@package-shared/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useSession } from "@features/session";
import { apiFetch } from "@shared/api/http";
import { useToast } from "@shared/ui";

export function useLoginMutation() {
  const router = useRouter();
  const { setSession } = useSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: LoginBody) =>
      apiFetch<AuthResponseData>(API_PATHS.auth.login, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
      }),
    onSuccess(response) {
      setSession(response.data.session, response.data.accessToken);
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.AUTH.LOGIN.S,
      });
      router.push("/map");
      router.refresh();
    },
    onError() {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.AUTH.LOGIN.E,
      });
    },
  });
}

export function useSignUpMutation() {
  const router = useRouter();
  const { setSession } = useSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: SignUpBody) =>
      apiFetch<AuthResponseData>(API_PATHS.auth.signup, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
      }),
    onSuccess(response) {
      setSession(response.data.session, response.data.accessToken);
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.AUTH.SIGNIN.S,
      });
      router.push("/map");
      router.refresh();
    },
    onError() {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.AUTH.SIGNIN.E,
      });
    },
  });
}
