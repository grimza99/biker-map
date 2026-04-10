import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  CreateRouteBody,
  UpdateRouteBody,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRouteMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRouteBody) =>
      apiFetch(API_PATHS.routes.list, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      //toast
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routes(),
      });
    },
  });
}

export function useEditRouteMutate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRouteBody) =>
      apiFetch(API_PATHS.routes.detail(id), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      //toast
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routes(),
      }),
        await queryClient.invalidateQueries({
          queryKey: queryKeys.route(id),
        });
    },
  });
}

export function useDeleteRouteMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) =>
      apiFetch(API_PATHS.routes.detail(routeId), {
        method: "DELETE",
      }),
    onSuccess: async () => {
      //toast

      await queryClient.invalidateQueries({ queryKey: queryKeys.routes() });
    },
  });
}
