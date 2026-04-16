import { apiFetch, queryKeys } from "@/shared";
import {
  API_PATHS,
  CreatePlaceBody,
  CreatePlaceResponseData,
  DeletePlaceResponseData,
  UpdatePlaceBody,
  UpdatePlaceResponseData,
} from "@package-shared/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlaceBody) =>
      apiFetch<CreatePlaceResponseData>(API_PATHS.places.list, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.places() });
    },
  });
}

export function useEditPlace(placeId: string) {
  const queryClient = useQueryClient();
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
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
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
    },
  });
}
