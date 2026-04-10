import { apiFetch } from "@/shared";
import {
  API_PATHS,
  CreatePlaceBody,
  CreatePlaceResponseData,
} from "@package-shared/index";
import { useMutation } from "@tanstack/react-query";

export function useCreatePlace() {
  return useMutation({
    mutationFn: (payload: CreatePlaceBody) =>
      apiFetch<CreatePlaceResponseData>(API_PATHS.places.list, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
