"use client";

import { ArrowLeftToLine } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useCallback, useMemo } from "react";

import {
  mapCategoryOptions,
  PATHS,
  PlaceListItem,
  RouteMapPathItem,
} from "@biker-map/package-shared";

import { NaverDynamicMap } from "@/entities/map";
import { Button } from "@shared/ui";

import { useMapCanvasData } from "./MapCanvasDataProvider";

const EMPTY_PLACES: PlaceListItem[] = [];
const EMPTY_ROUTES: RouteMapPathItem[] = [];

export function MapCanvasShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { category, setCategory, placesQuery, routeMapPathsQuery } =
    useMapCanvasData();
  const places = placesQuery.data?.data.items ?? EMPTY_PLACES;
  const routes = routeMapPathsQuery.data?.data.items ?? EMPTY_ROUTES;
  const visiblePlaces = useMemo(
    () => (category === "route" ? EMPTY_PLACES : places),
    [category, places]
  );
  const visibleRoutes = useMemo(
    () => (category === "route" || category === "all" ? routes : EMPTY_ROUTES),
    [category, routes]
  );
  const handleClickPlaceMarker = useCallback(
    (place: PlaceListItem) => {
      router.push(PATHS.map.detailPlace(place.id));
    },
    [router]
  );
  const handleClickRoutePolyline = useCallback(
    (route: RouteMapPathItem) => {
      router.push(PATHS.map.detailRoute(route.routeId));
    },
    [router]
  );
  const handleOpenListPanel = useCallback(() => {
    const searchParams = new URLSearchParams();
    const isRouteContext =
      category === "route" || pathname.startsWith(PATHS.map.detailRoute(""));

    if (isRouteContext) {
      searchParams.set("category", "route");
    }

    const targetPath = searchParams.toString()
      ? `${PATHS.map.list}?${searchParams.toString()}`
      : PATHS.map.list;

    router.push(targetPath);
  }, [category, pathname, router]);

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
              onClick={handleOpenListPanel}
            >
              <ArrowLeftToLine className="m-0 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
