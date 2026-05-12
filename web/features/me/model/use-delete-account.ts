"use client";

import {
  API_PATHS,
  TOAST_MESSAGE,
  type DeleteAccountResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";
import { useToast } from "@shared/ui";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeleteAccountResponseData>(API_PATHS.me.profile, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.removeQueries({ queryKey: queryKeys.session }),
        queryClient.removeQueries({ queryKey: queryKeys.myPosts() }),
        queryClient.removeQueries({ queryKey: queryKeys.myRoutes() }),
        queryClient.removeQueries({ queryKey: queryKeys.meFavoritesRoot }),
        queryClient.removeQueries({ queryKey: queryKeys.notificationsRoot }),
      ]);
      showToast({
        title: TOAST_MESSAGE.MY.ACCOUNT.D,
        tone: "success",
      });
    },
    onError: () => {
      showToast({
        title: TOAST_MESSAGE.MY.ACCOUNT.E,
        tone: "danger",
      });
    },
  });
}
