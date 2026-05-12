import { apiFetch, queryKeys, useToast } from "@/shared";
import {
  API_PATHS,
  CreatePlaceBody,
  CreatePlaceResponseData,
  DeletePlaceResponseData,
  TOAST_MESSAGE,
  UpdatePlaceBody,
  UpdatePlaceResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePlace() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreatePlaceBody) =>
      apiFetch<CreatePlaceResponseData>(API_PATHS.places.list, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.places() });
      showToast({
        title: TOAST_MESSAGE.ADMIN.C,
        tone: "success",
      });
    },
  });
}

export function useEditPlace(placeId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdatePlaceBody) =>
      apiFetch<UpdatePlaceResponseData>(API_PATHS.places.detail(placeId), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.places() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.place(placeId),
      });
      showToast({
        title: TOAST_MESSAGE.ADMIN.E,
        tone: "success",
      });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (placeId: string) =>
      apiFetch<DeletePlaceResponseData>(API_PATHS.places.detail(placeId), {
        method: "DELETE",
      }),
    onSuccess: async (_, placeId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.places() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.place(placeId),
      });
      showToast({
        title: TOAST_MESSAGE.ADMIN.D,
        tone: "success",
      });
    },
  });
}
