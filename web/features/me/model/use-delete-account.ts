"use client";

import {
  API_PATHS,
  type DeleteAccountResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@shared/api/http";
import { queryKeys } from "@shared/config/query-keys";

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<DeleteAccountResponseData>(API_PATHS.me.profile, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      // TODO: 성공 토스트는 호출부에서 처리한다.
      await Promise.all([
        queryClient.removeQueries({ queryKey: queryKeys.session }),
        queryClient.removeQueries({ queryKey: queryKeys.myPosts() }),
        queryClient.removeQueries({ queryKey: queryKeys.myRoutes() }),
      ]);
    },
    onError: () => {
      // TODO: 에러 토스트는 호출부에서 처리한다.
    },
  });
}
