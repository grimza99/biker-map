import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  CreateRouteBody,
  UpdateRouteBody,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/ui";

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
        title: "경로가 등록되었습니다",
        description: "새 경로가 목록에 반영되었습니다.",
        tone: "success",
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
        title: "경로가 수정되었습니다",
        description: "변경 내용이 저장되었습니다.",
        tone: "success",
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
        title: "경로가 삭제되었습니다",
        description: "목록에서 제거되었습니다.",
        tone: "info",
      });
    },
  });
}
