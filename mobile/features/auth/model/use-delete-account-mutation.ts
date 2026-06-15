"use client";

import { apiFetch } from "@/shared";
import { useSession } from "@/features/session/model";
import {
  API_PATHS,
  queryKeys,
  TOAST_MESSAGE,
  type DeleteAccountResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { clearSession } = useSession();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeleteAccountResponseData>(API_PATHS.me.profile, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await clearSession();
      await Promise.all([
        queryClient.removeQueries({ queryKey: queryKeys.session }),
        queryClient.removeQueries({ queryKey: queryKeys.myPosts() }),
        queryClient.removeQueries({ queryKey: queryKeys.myRoutes() }),
        queryClient.removeQueries({ queryKey: queryKeys.favoritesRoot }),
        queryClient.removeQueries({ queryKey: queryKeys.notificationsRoot }),
      ]);
      Alert.alert(TOAST_MESSAGE.MY.ACCOUNT.D);
    },
    onError: () => {
      Alert.alert(TOAST_MESSAGE.MY.ACCOUNT.E);
    },
  });
}
