"use client";
import { API_PATHS, queryKeys, TOAST_MESSAGE } from "@package-shared/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/features/session";
import { apiFetch, useToast } from "@/shared";
import {
  ApiResponse,
  AuthVerifyResponseData,
  ISendVerificationCodeBody,
  ISendVerificationCodeResponseData,
  IVerificationCodeCheckBody,
  MeResponseData,
} from "@package-shared/index";

/**--------------------------------verification code 문자 보내기 -------------------- */
export function useSendSMSVerificationCodeMutation(
  payload: ISendVerificationCodeBody
) {
  return useMutation({
    mutationFn: () =>
      apiFetch<ISendVerificationCodeResponseData>(
        API_PATHS.auth.sendVerificationCode,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ),
  });
}

/**--------------------------------인증 code 일치 확인 ------------------------------- */
export function useVerifyMuation(payload: IVerificationCodeCheckBody) {
  const queryClient = useQueryClient();
  const sessionState = useSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () =>
      apiFetch<AuthVerifyResponseData>(API_PATHS.auth.verify, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async (response) => {
      const nextSession = response.data.session;
      sessionState.setSession(nextSession, sessionState.accessToken);
      queryClient.setQueryData<ApiResponse<MeResponseData>>(queryKeys.session, {
        data: {
          authenticated: Boolean(nextSession),
          session: nextSession,
        },
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      showToast({
        tone: "success",
        title: TOAST_MESSAGE.AUTH.VERIFY.S,
      });
    },
    onError: () => {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.AUTH.VERIFY.E,
      });
    },
  });
}
