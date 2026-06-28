"use client";

import type { PlaceListItem } from "@package-shared/types/place";
import type { RouteMapPathItem } from "@package-shared/types/route";
import { ArrowLeftToLine } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo } from "react";

import { NaverDynamicMap, mapCategoryOptions } from "@/entities/map";
import { Button } from "@shared/ui";

import { PATHS } from "@package-shared/constants";
import { useMapCanvasData } from "./MapCanvasDataProvider";

const EMPTY_PLACES: PlaceListItem[] = [];
const EMPTY_ROUTES: RouteMapPathItem[] = [];

export function MapCanvasShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (pathname !== PATHS.map.list) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (category === "route") {
      nextSearchParams.set("category", "route");
    } else {
      nextSearchParams.delete("category");
    }

    const currentQuery = searchParams.toString();
    const nextQuery = nextSearchParams.toString();

    if (currentQuery === nextQuery) {
      return;
    }

    const targetPath = nextQuery
      ? `${PATHS.map.list}?${nextQuery}`
      : PATHS.map.list;

    router.replace(targetPath, { scroll: false });
  }, [category, pathname, router, searchParams]);

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
