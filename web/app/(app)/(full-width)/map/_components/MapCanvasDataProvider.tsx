"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import type { MapCategoryFilter } from "@/entities/map";
import { usePlaces } from "@features/places/model/use-places";
import { useRouteMapPaths } from "@features/routes/model/use-route-map-paths";

type PlacesQueryResult = ReturnType<typeof usePlaces>;
type RouteMapPathsQueryResult = ReturnType<typeof useRouteMapPaths>;

type MapCanvasDataContextValue = {
  category: MapCategoryFilter;
  setCategory: Dispatch<SetStateAction<MapCategoryFilter>>;
  placesQuery: PlacesQueryResult;
  routeMapPathsQuery: RouteMapPathsQueryResult;
};

const MapCanvasDataContext =
  createContext<MapCanvasDataContextValue | null>(null);

export function MapCanvasDataProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<MapCategoryFilter>("all");
  const placeCategory = category === "route" ? undefined : category;
  const filters = useMemo(
    () => ({
      category: placeCategory,
      limit: 100,
    }),
    [placeCategory]
  );
  const placesQuery = usePlaces(filters);
  const routeMapPathsQuery = useRouteMapPaths();
  const value = useMemo(
    () => ({
      category,
      setCategory,
      placesQuery,
      routeMapPathsQuery,
    }),
    [category, placesQuery, routeMapPathsQuery]
  );

  return (
    <MapCanvasDataContext.Provider value={value}>
      {children}
    </MapCanvasDataContext.Provider>
  );
}

export function useMapCanvasData() {
  const value = useContext(MapCanvasDataContext);

  if (!value) {
    throw new Error("useMapCanvasData must be used within MapCanvasDataProvider");
  }

  return value;
}
