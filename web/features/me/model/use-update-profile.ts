"use client";

import {
  API_PATHS,
  TOAST_MESSAGE,
  type ApiResponse,
  type MeResponseData,
  type UpdateMeBody,
  type UpdateMeResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@features/session/model/use-session";
import { apiFetch } from "@shared/api/http";
import { queryKeys, useToast } from "@shared/index";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const sessionState = useSession();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateMeBody) =>
      apiFetch<UpdateMeResponseData>(API_PATHS.me.profile, {
        method: "PATCH",
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
        title: TOAST_MESSAGE.MY.U,
      });
    },
    onError: () => {
      showToast({
        tone: "danger",
        title: TOAST_MESSAGE.MY.E,
      });
    },
  });
}
