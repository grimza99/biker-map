"use client";
import { API_PATHS } from "@package-shared/constants";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/shared";
import {
  ISendVerificationCodeBody,
  ISendVerificationCodeResponseData,
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
