import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  CreateRouteBody,
  TOAST_MESSAGE,
  UpdateRouteBody,
} from "@package-shared/index";
import { useToast } from "@shared/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateRouteMutate() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (payload: CreateRouteBody) =>
      apiFetch(API_PATHS.routes.list, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routes(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.myRoutes(),
      });
      showToast({
        title: TOAST_MESSAGE.ROUTE.C,
        tone: "success",
      });
    },
    onError: async () => {
      showToast({
        title: TOAST_MESSAGE.ROUTE.E,
        tone: "danger",
      });
    },
  });
}

export function useEditRouteMutate(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (payload: UpdateRouteBody) =>
      apiFetch(API_PATHS.routes.detail(id), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.routes(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.route(id),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myRoutes() });
      showToast({
        title: TOAST_MESSAGE.ROUTE.U,
        tone: "success",
      });
    },
    onError: async () => {
      showToast({
        title: TOAST_MESSAGE.ROUTE.E,
        tone: "danger",
      });
    },
  });
}

export function useDeleteRouteMutate() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (routeId: string) =>
      apiFetch(API_PATHS.routes.detail(routeId), {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.routes() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.myRoutes() });
      showToast({
        title: TOAST_MESSAGE.ROUTE.D,
        tone: "info",
      });
    },
  });
}
