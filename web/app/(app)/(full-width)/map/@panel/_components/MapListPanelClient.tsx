"use client";

import { useMemo, useState } from "react";

import { MapSidePanel } from "@/entities/map";
import { usePlaces } from "@features/places/model/use-places";

export function MapListPanelClient() {
  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => ({
      search,
      limit: 100,
    }),
    [search]
  );
  const { data, isLoading, isError, error, isPlaceholderData } =
    usePlaces(filters);
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
