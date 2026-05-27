"use client";

import { usePlaces } from "@features/places/model/use-places";
import { useRouteMapPaths } from "@features/routes/model/use-route-map-paths";
import type { PlaceListItem } from "@package-shared/types/place";
import type { RouteMapPathItem } from "@package-shared/types/route";
import { ArrowLeftToLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useMemo, useState } from "react";

import {
  NaverDynamicMap,
  mapCategoryOptions,
  type MapCategoryFilter,
} from "@/entities/map";
import { Button } from "@shared/ui";

export function MapCanvasShell() {
  const router = useRouter();
  const [category, setCategory] = useState<MapCategoryFilter | undefined>(
    "all"
  );
  const placeCategory = category === "route" ? undefined : category;
  const filters = useMemo(
    () => ({
      category: placeCategory,
      limit: 100,
    }),
    [placeCategory]
  );
  const { data } = usePlaces(filters);
  const routeMapPathsQuery = useRouteMapPaths();
  const places = data?.data.items ?? [];
  const routes = routeMapPathsQuery.data?.data.items ?? [];
  const visiblePlaces = category === "route" ? [] : places;
  const visibleRoutes =
    category === "route" || category === "all" ? routes : [];
  const handleClickPlaceMarker = useCallback(
    (place: PlaceListItem) => {
      router.push(`/map/places/${place.id}`);
    },
    [router]
  );
  const handleClickRoutePolyline = useCallback(
    (route: RouteMapPathItem) => {
      router.push(`/map/routes/${route.routeId}`);
    },
    [router]
  );

  return (
    <div className="relative min-h-[calc(100vh-11rem)] h-full overflow-hidden">
      <NaverDynamicMap
        places={visiblePlaces}
        routes={visibleRoutes}
        onClickPlaceMarker={handleClickPlaceMarker}
        onClickRoutePolyline={handleClickRoutePolyline}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="flex h-full w-full items-start justify-between gap-4 p-5 md:p-6">
          <div className="pointer-events-auto flex flex-wrap gap-2 rounded-2xl border border-border bg-panel/82 p-2 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl">
            {mapCategoryOptions.map((filter) => {
              const active = category === filter.value;

              return (
                <Button
                  key={filter.value}
                  variant="secondary"
                  onClick={() =>
                    startTransition(() =>
                      setCategory((current) =>
                        current === filter.value ? "all" : filter.value
                      )
                    )
                  }
                  selected={active}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <div className="pointer-events-auto">
            <Button
              variant="primary"
              size="icon"
              aria-label="목록 패널 열기"
              onClick={() => router.push("/map/list")}
            >
              <ArrowLeftToLine className="m-0 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
