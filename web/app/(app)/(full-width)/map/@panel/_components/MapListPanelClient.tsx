"use client";

import { useMemo, useState } from "react";

import { MapSidePanel } from "@/entities/map";
import { usePlaces } from "@features/places/model/use-places";

import { useMapCanvasData } from "../../_components/MapCanvasDataProvider";

export function MapListPanelClient() {
  const [search, setSearch] = useState("");
  const { placesQuery: mapPlacesQuery } = useMapCanvasData();
  const trimmedSearch = search.trim();
  const filters = useMemo(
    () => ({
      search: trimmedSearch,
      limit: 100,
    }),
    [trimmedSearch]
  );
  const searchPlacesQuery = usePlaces(filters, {
    enabled: trimmedSearch.length > 0,
  });
  const activePlacesQuery =
    trimmedSearch.length > 0 ? searchPlacesQuery : mapPlacesQuery;
  const { data, isLoading, isError, error, isPlaceholderData } =
    activePlacesQuery;
  const places = data?.data.items ?? [];

  return (
    <MapSidePanel
      places={places}
      onChangeSearchInput={setSearch}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isStale={isPlaceholderData}
    />
  );
}
