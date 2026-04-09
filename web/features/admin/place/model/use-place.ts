import { apiFetch } from "@/shared";
import {
  CreatePlaceBody,
  CreatePlaceResponseData,
} from "@package-shared/index";
import { useMutation } from "@tanstack/react-query";

export function useCreatePlace() {
  return useMutation({
    mutationFn: (payload: CreatePlaceBody) =>
      apiFetch<CreatePlaceResponseData>("/api/places", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
