import { API_PATHS, queryKeys } from "@package-shared/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiResponse,
  AuthVerifyResponseData,
  ISendVerificationCodeBody,
  ISendVerificationCodeResponseData,
  IVerificationCodeCheckBody,
  MeResponseData,
} from "@package-shared/index";
import { apiFetch } from "@/shared";
import { Alert } from "react-native";
import { useSession } from "@/features/session/model";

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
    onError: () => {
      Alert.alert("인증번호 발송에 실패 했습니다. 잠시후 다시 시도해 주세요");
    },
  });
}

/**--------------------------------인증 code 일치 확인 ------------------------------- */
export function useVerifyMuation(payload: IVerificationCodeCheckBody) {
  const queryClient = useQueryClient();
  const { setSession } = useSession();
  return useMutation({
    mutationFn: () =>
      apiFetch<AuthVerifyResponseData>(API_PATHS.auth.verify, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async (response) => {
      const nextSession = response.data;
      setSession(nextSession);
      queryClient.setQueryData<ApiResponse<MeResponseData>>(queryKeys.session, {
        data: {
          authenticated: Boolean(nextSession),
          session: nextSession,
        },
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
    onError: () => {
      Alert.alert("본인 인증에 실패 했습니다. 잠시후 다시 시도해 주세요");
    },
  });
}
