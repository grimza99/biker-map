"use client";

import {
  API_PATHS,
  type PlaceGeocodeResponseData,
} from "@package-shared/index";
import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/shared";
import { apiFetch } from "@shared/api/http";

export function usePlaceGeocode(address: string, enabled = true) {
  const normalizedAddress = address.trim();
  const debouncedAddress = useDebouncedValue(normalizedAddress, 600);

  return useQuery({
    queryKey: ["place-geocode", debouncedAddress],
    queryFn: async () =>
      apiFetch<PlaceGeocodeResponseData>(
        `${API_PATHS.places.geocode}?query=${encodeURIComponent(
          debouncedAddress
        )}`
      ),
    enabled: enabled && debouncedAddress.length >= 6,
    staleTime: 1000 * 60 * 5,
  });
}
