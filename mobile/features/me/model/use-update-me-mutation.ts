import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

import {
  API_PATHS,
  queryKeys,
  type ApiResponse,
  type MeResponseData,
  type UpdateMeBody,
  type UpdateMeResponseData,
} from "@package-shared/index";

import { useSession } from "@/features/session/model";
import { apiFetch } from "@/shared";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const { setSession } = useSession();

  return useMutation({
    mutationFn: (payload: UpdateMeBody) =>
      apiFetch<UpdateMeResponseData>(API_PATHS.me.profile, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async (response) => {
      const nextSession = response.data.session;
      if (nextSession) setSession(nextSession);
      queryClient.setQueryData<ApiResponse<MeResponseData>>(queryKeys.session, {
        data: {
          authenticated: Boolean(nextSession),
          session: nextSession,
        },
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      Alert.alert("프로필 수정 성공");
    },
    onError: (error) => {
      Alert.alert("프로필 수정 실패", error.message);
    },
  });
}
